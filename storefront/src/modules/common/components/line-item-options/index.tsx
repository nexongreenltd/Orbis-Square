import { HttpTypes } from "@medusajs/types"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  return (
    <span
      data-testid={dataTestid}
      data-value={dataValue}
      className="block truncate text-xs text-ink-500"
    >
      {variant?.title}
    </span>
  )
}

export default LineItemOptions
