import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  "data-testid": dataTestid,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  "data-testid"?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <button
      type="button"
      onClick={() => handleDelete(id)}
      data-testid={dataTestid}
      className={clx(
        "flex items-center gap-x-1 text-xs text-ink-500 transition-colors hover:text-orbis-600",
        className
      )}
    >
      {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
      {children && <span>{children}</span>}
      <span className="sr-only">Remove item from cart</span>
    </button>
  )
}

export default DeleteButton
