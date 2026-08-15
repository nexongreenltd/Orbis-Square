import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        // Renders BDT as "৳280" rather than "BDT 280.00".
        currencyDisplay: "narrowSymbol",
        // Whole amounts drop the ".00" — BDT is quoted in whole taka in the
        // catalogue, and the design shows it that way.
        minimumFractionDigits:
          minimumFractionDigits ?? (Number.isInteger(amount) ? 0 : 2),
        maximumFractionDigits:
          maximumFractionDigits ?? (Number.isInteger(amount) ? 0 : 2),
      }).format(amount)
    : amount.toString()
}
