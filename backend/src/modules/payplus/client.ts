import crypto from 'crypto'
import { MedusaError } from '@medusajs/framework/utils'
import { PayPlusOptions, PayPlusSession, PayPlusStatus } from './types'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ADAPTER LAYER — the only file that knows PayPlus' wire format.
 *
 * Every endpoint path, request field and response field below is marked with
 * CONFIRM and reflects the shape a hosted-checkout gateway conventionally uses.
 * They have NOT been checked against the PayPlus documentation yet. When the
 * docs are available, correct them here; `PayPlusProviderService` consumes the
 * normalised `PayPlusSession` type and needs no changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINTS = {
  /** CONFIRM: create a hosted checkout session. */
  createSession: '/api/v1/payment/create',
  /** CONFIRM: query a transaction by its reference. */
  getSession: '/api/v1/payment/status',
  /** CONFIRM: refund a settled transaction. */
  refund: '/api/v1/payment/refund',
  /** CONFIRM: void an authorised-but-uncaptured transaction. */
  cancel: '/api/v1/payment/cancel',
}

export type CreateSessionArgs = {
  amount: number
  currency: string
  /** Our own idempotent reference; echoed back by the gateway. */
  orderReference: string
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
  /** Where PayPlus should send the customer once they finish paying. */
  returnUrl: string
  cancelUrl: string
  /** Server-to-server notification URL. */
  webhookUrl: string
}

export class PayPlusClient {
  constructor(private readonly options: PayPlusOptions) {}

  private get baseUrl(): string {
    const url = this.options.baseUrl
    if (!url) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        'PayPlus is not configured: set PAYPLUS_BASE_URL in the backend .env file.'
      )
    }
    return url.replace(/\/$/, '')
  }

  private assertConfigured(): void {
    const missing = (['baseUrl', 'merchantId', 'apiKey', 'secretKey'] as const).filter(
      (key) => !this.options[key]
    )

    if (missing.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `PayPlus is not configured. Missing: ${missing.join(', ')}. ` +
          'Fill in the PAYPLUS_* variables in the backend .env file.'
      )
    }
  }

  /** True when enough credentials are present to attempt a live call. */
  isConfigured(): boolean {
    return Boolean(
      this.options.baseUrl &&
        this.options.merchantId &&
        this.options.apiKey &&
        this.options.secretKey
    )
  }

  private async request<T = Record<string, unknown>>(
    path: string,
    body: Record<string, unknown>
  ): Promise<T> {
    this.assertConfigured()

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // CONFIRM: PayPlus may expect `Authorization: Bearer`, `x-api-key`,
        // or the key inside the JSON body instead of a header.
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        // CONFIRM: merchant/store identification field names.
        merchant_id: this.options.merchantId,
        store_id: this.options.storeId,
        ...body,
      }),
    })

    const text = await response.text()
    let payload: Record<string, unknown> = {}

    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `PayPlus returned a non-JSON response (${response.status}): ${text.slice(0, 500)}`
      )
    }

    if (!response.ok) {
      const message =
        (payload.message as string) ||
        (payload.error as string) ||
        `PayPlus request failed with status ${response.status}`
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)
    }

    return payload as T
  }

  /**
   * Normalises whatever status string PayPlus uses into our own enum.
   * CONFIRM: the exact status vocabulary against the docs.
   */
  static normaliseStatus(raw: unknown): PayPlusStatus {
    const value = String(raw ?? '').toLowerCase()

    if (['success', 'completed', 'paid', 'captured', 'settled'].includes(value)) {
      return 'captured'
    }
    if (['authorized', 'authorised', 'approved', 'hold'].includes(value)) {
      return 'authorized'
    }
    if (['failed', 'declined', 'error', 'invalid'].includes(value)) {
      return 'failed'
    }
    if (['canceled', 'cancelled', 'void', 'expired'].includes(value)) {
      return 'canceled'
    }
    if (['refunded', 'refund'].includes(value)) {
      return 'refunded'
    }
    return 'pending'
  }

  /** Maps a raw gateway payload onto our normalised session shape. */
  private static toSession(raw: Record<string, unknown>): PayPlusSession {
    // CONFIRM: response field names for reference / redirect URL / amount.
    const reference = String(
      raw.transaction_id ?? raw.payment_id ?? raw.reference ?? raw.id ?? ''
    )
    const redirectUrl = (raw.redirect_url ??
      raw.checkout_url ??
      raw.payment_url ??
      raw.gateway_url) as string | undefined

    return {
      reference,
      redirectUrl,
      status: PayPlusClient.normaliseStatus(raw.status ?? raw.payment_status),
      amount: raw.amount != null ? Number(raw.amount) : undefined,
      currency: (raw.currency as string) ?? undefined,
      raw,
    }
  }

  async createSession(args: CreateSessionArgs): Promise<PayPlusSession> {
    const payload = await this.request(ENDPOINTS.createSession, {
      // CONFIRM: request field names.
      amount: args.amount,
      currency: args.currency,
      order_id: args.orderReference,
      customer_name: args.customer?.name,
      customer_email: args.customer?.email,
      customer_phone: args.customer?.phone,
      success_url: args.returnUrl,
      fail_url: args.cancelUrl,
      cancel_url: args.cancelUrl,
      ipn_url: args.webhookUrl,
    })

    const session = PayPlusClient.toSession(payload)

    if (!session.reference) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        'PayPlus did not return a transaction reference when creating the session.'
      )
    }

    return session
  }

  async getSession(reference: string): Promise<PayPlusSession> {
    const payload = await this.request(ENDPOINTS.getSession, {
      // CONFIRM: lookup field name.
      transaction_id: reference,
    })
    return PayPlusClient.toSession(payload)
  }

  async refund(reference: string, amount: number): Promise<PayPlusSession> {
    const payload = await this.request(ENDPOINTS.refund, {
      transaction_id: reference,
      amount,
    })
    return PayPlusClient.toSession(payload)
  }

  async cancel(reference: string): Promise<PayPlusSession> {
    const payload = await this.request(ENDPOINTS.cancel, {
      transaction_id: reference,
    })
    return PayPlusClient.toSession(payload)
  }

  /**
   * Verifies the authenticity of a webhook/IPN callback.
   *
   * CONFIRM: the signing scheme. Bangladeshi gateways commonly use either an
   * HMAC-SHA256 over the raw request body, or an MD5/SHA-256 hash over a
   * specific concatenation of fields plus the store passphrase. This implements
   * the former; adjust once the docs confirm which one PayPlus uses.
   *
   * Until the scheme is verified this returns `false` for any request carrying
   * no signature, so unsigned callbacks are never trusted.
   */
  verifyWebhookSignature(
    rawBody: Buffer | string,
    signature: string | undefined
  ): boolean {
    if (!signature || !this.options.secretKey) {
      return false
    }

    const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8')
    const expected = crypto
      .createHmac('sha256', this.options.secretKey)
      .update(body)
      .digest('hex')

    const provided = signature.trim().toLowerCase()
    const expectedBuf = Buffer.from(expected, 'utf8')
    const providedBuf = Buffer.from(provided, 'utf8')

    if (expectedBuf.length !== providedBuf.length) {
      return false
    }

    return crypto.timingSafeEqual(expectedBuf, providedBuf)
  }
}
