import React from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  "data-testid"?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  "data-testid": dataTestId,
}) => {
  return (
    <label className="group flex cursor-pointer items-center gap-x-2.5">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        {/* A real checkbox keeps the `on` value in the submitted FormData —
            `setAddresses` reads `same_as_billing` straight off the form. */}
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          data-testid={dataTestId}
          className="peer h-4 w-4 appearance-none border border-ink-300 outline-none transition-colors checked:border-orbis-600 checked:bg-orbis-600 group-hover:border-ink-500 checked:group-hover:border-orbis-600"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute hidden h-2.5 w-2.5 text-white peer-checked:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 6.5 4.5 9 10 3.5" />
        </svg>
      </span>
      <span className="text-sm text-ink-700">{label}</span>
    </label>
  )
}

export default CheckboxWithLabel
