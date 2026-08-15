import { randomUUID } from 'crypto'
import {
  AbstractPaymentProvider,
  BigNumber,
  MedusaError,
} from '@medusajs/framework/utils'
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/framework/types'
import { PayPlusClient } from './client'
import { PayPlusOptions, PayPlusPaymentData, PayPlusStatus } from './types'

type InjectedDependencies = {
  logger: Logger
}

/**
 * PayPlus is a redirect / hosted-checkout gateway: the customer leaves the
 * storefront, pays on PayPlus' page, and comes back. That maps onto Medusa's
 * deferred authorization flow — `authorizePayment` returns
 * `pending_authorization` until the gateway confirms the payment, either via
 * the customer returning or via the IPN webhook.
 */
class PayPlusProviderService extends AbstractPaymentProvider<PayPlusOptions> {
  static identifier = 'payplus'

  protected readonly logger_: Logger
  protected readonly options_: PayPlusOptions
  protected readonly client_: PayPlusClient

  constructor(container: InjectedDependencies, options: PayPlusOptions) {
    super(container, options)

    this.logger_ = container.logger
    this.options_ = options
    this.client_ = new PayPlusClient(options)

    if (!this.client_.isConfigured()) {
      // Deliberately a warning, not a throw: the store must still boot before
      // the merchant credentials have been filled in.
      this.logger_.warn(
        '[payplus] Provider registered without complete credentials. ' +
          'Checkout with PayPlus will fail until the PAYPLUS_* variables are set in .env.'
      )
    }
  }

  /**
   * Where PayPlus sends the customer back to, and where it posts its IPN.
   * The webhook path is Medusa's built-in payment hook endpoint.
   */
  private get urls() {
    const storefront = process.env.STOREFRONT_URL || 'http://localhost:8000'
    const backend = process.env.BACKEND_URL || 'http://localhost:9000'

    return {
      returnUrl: `${storefront}/payplus/return`,
      cancelUrl: `${storefront}/payplus/return?status=cancelled`,
      // Medusa exposes POST /hooks/payment/{provider}_{id}
      webhookUrl: `${backend}/hooks/payment/payplus_payplus`,
    }
  }

  private static readData(data: Record<string, unknown> | undefined): PayPlusPaymentData {
    const reference = data?.reference as string | undefined

    if (!reference) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        '[payplus] No PayPlus transaction reference found on the payment session.'
      )
    }

    return data as PayPlusPaymentData
  }

  private static toSessionStatus(status: PayPlusStatus) {
    switch (status) {
      case 'captured':
        return 'captured' as const
      case 'authorized':
        return 'authorized' as const
      case 'failed':
        return 'error' as const
      case 'canceled':
        return 'canceled' as const
      default:
        return 'pending' as const
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const amount = Number(input.amount)
    const customer = input.context?.customer

    const orderReference = `os_${input.context?.idempotency_key ?? randomUUID()}`

    const session = await this.client_.createSession({
      amount,
      currency: input.currency_code.toUpperCase(),
      orderReference,
      customer: {
        name: [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || undefined,
        email: customer?.email,
        phone: customer?.phone ?? undefined,
      },
      ...this.urls,
    })

    const data: PayPlusPaymentData = {
      reference: session.reference,
      // The storefront reads this to redirect the customer to PayPlus.
      redirect_url: session.redirectUrl,
      status: session.status,
      amount,
      currency: input.currency_code,
    }

    return { id: session.reference, data: data as unknown as Record<string, unknown> }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const stored = PayPlusProviderService.readData(input.data)
    const session = await this.client_.getSession(stored.reference)

    const data = {
      ...stored,
      status: session.status,
      raw: session.raw,
    } as unknown as Record<string, unknown>

    switch (session.status) {
      case 'captured':
        return { status: 'captured', data }
      case 'authorized':
        return { status: 'authorized', data }
      case 'failed':
        return { status: 'error', data }
      case 'canceled':
        return { status: 'canceled', data }
      default:
        // The customer has not finished paying on PayPlus' page yet. Medusa
        // will create the order in an "awaiting payment" state and call this
        // method again when the webhook arrives.
        return { status: 'pending_authorization', data }
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const stored = PayPlusProviderService.readData(input.data)
    const session = await this.client_.getSession(stored.reference)

    if (session.status !== 'captured' && session.status !== 'authorized') {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `[payplus] Cannot capture transaction ${stored.reference}: gateway status is "${session.status}".`
      )
    }

    // Hosted-checkout transactions settle on PayPlus' side; there is no
    // separate capture call to make.
    // CONFIRM: whether PayPlus supports auth-then-capture. If it does, call the
    // capture endpoint here instead of only re-reading the status.
    return {
      data: {
        ...stored,
        status: 'captured',
        raw: session.raw,
      } as unknown as Record<string, unknown>,
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const stored = PayPlusProviderService.readData(input.data)
    const session = await this.client_.refund(stored.reference, Number(input.amount))

    return {
      data: {
        ...stored,
        status: session.status,
        raw: session.raw,
      } as unknown as Record<string, unknown>,
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const reference = (input.data as PayPlusPaymentData | undefined)?.reference

    if (!reference) {
      return { data: input.data ?? {} }
    }

    try {
      const session = await this.client_.cancel(reference)
      return {
        data: {
          ...(input.data as object),
          status: session.status,
          raw: session.raw,
        } as unknown as Record<string, unknown>,
      }
    } catch (error) {
      // A transaction the customer simply abandoned may not be cancellable.
      this.logger_.warn(
        `[payplus] Could not cancel transaction ${reference}: ${(error as Error).message}`
      )
      return { data: input.data ?? {} }
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return this.cancelPayment(input)
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const stored = PayPlusProviderService.readData(input.data)
    const session = await this.client_.getSession(stored.reference)
    return { data: session.raw }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const stored = PayPlusProviderService.readData(input.data)
    const session = await this.client_.getSession(stored.reference)

    return {
      status: PayPlusProviderService.toSessionStatus(session.status),
      data: session.raw,
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // PayPlus sessions are created for a fixed amount. If the cart total moved,
    // start a fresh session rather than mutating the existing one.
    const stored = input.data as PayPlusPaymentData | undefined

    if (stored?.amount != null && Number(stored.amount) === Number(input.amount)) {
      return { data: input.data ?? {} }
    }

    return this.initiatePayment(input as InitiatePaymentInput)
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload

    // CONFIRM: the header PayPlus signs its callbacks with.
    const signature = (headers?.['x-payplus-signature'] ??
      headers?.['x-signature'] ??
      headers?.['signature']) as string | undefined

    if (!this.client_.verifyWebhookSignature(rawData as Buffer, signature)) {
      this.logger_.warn('[payplus] Rejected a webhook with an invalid or missing signature.')
      return {
        action: 'failed',
        data: { session_id: '', amount: new BigNumber(0) },
      }
    }

    const body = data as Record<string, unknown>
    const reference = String(
      body.transaction_id ?? body.payment_id ?? body.reference ?? body.id ?? ''
    )
    const amount = new BigNumber(Number(body.amount ?? 0))
    const status = PayPlusClient.normaliseStatus(body.status ?? body.payment_status)

    // Medusa matches the webhook to a payment session by this id. It must be
    // the same value `initiatePayment` returned as `id`.
    const result = { session_id: reference, amount }

    switch (status) {
      case 'captured':
        return { action: 'captured', data: result }
      case 'authorized':
        return { action: 'authorized', data: result }
      case 'failed':
        return { action: 'failed', data: result }
      case 'canceled':
        return { action: 'canceled', data: result }
      default:
        return { action: 'pending', data: result }
    }
  }
}

export default PayPlusProviderService
