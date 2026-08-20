import { clx } from "@medusajs/ui"

const Radio = ({
  checked,
  "data-testid": dataTestId,
}: {
  checked: boolean
  "data-testid"?: string
}) => {
  return (
    <span
      aria-hidden
      data-state={checked ? "checked" : "unchecked"}
      data-testid={dataTestId || "radio-button"}
      className={clx(
        "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
        checked ? "border-orbis-600" : "border-ink-300"
      )}
    >
      {checked && <span className="h-2 w-2 bg-orbis-600" />}
    </span>
  )
}

export default Radio
