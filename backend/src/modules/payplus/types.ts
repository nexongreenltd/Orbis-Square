export type PayPlusOptions = {
  /** Base URL of the PayPlus API, e.g. https://api.payplus.com.bd */
  baseUrl?: string
  merchantId?: string
  storeId?: string
  apiKey?: string
  secretKey?: string
  /** When true, point the client at PayPlus' sandbox environment. */
  sandbox?: boolean
}

/**
 * The subset of a PayPlus session we depend on, normalised away from whatever
 * field names the gateway actually uses. `PayPlusClient` is the only place that
 * translates between this shape and the wire format.
 */
export type PayPlusSession = {
  /** PayPlus' own identifier for the transaction. */
  reference: string
  /** Hosted checkout page the customer must be sent to. */
  redirectUrl?: string
  /** Gateway status, already normalised. */
  status: PayPlusStatus
  /** Amount echoed back by the gateway, in major units (Taka). */
  amount?: number
  currency?: string
  /** Everything the gateway returned, kept for debugging and reconciliation. */
  raw: Record<string, unknown>
}

export type PayPlusStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'canceled'
  | 'refunded'

/** Data we persist on the Medusa payment session / payment record. */
export type PayPlusPaymentData = {
  reference: string
  redirect_url?: string
  status: PayPlusStatus
  amount?: number
  currency?: string
  raw?: Record<string, unknown>
}
