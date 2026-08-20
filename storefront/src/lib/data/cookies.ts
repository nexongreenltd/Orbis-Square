import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

/**
 * Catalogue data is fetched with `cache: "force-cache"`, which without a
 * revalidate window caches indefinitely — a product edited in the admin never
 * reaches the storefront until the next deploy. The cache tags below cannot
 * cover that on their own: they are keyed to a per-visitor cache-id cookie, so
 * nothing server-side (a Medusa subscriber, say) can target them.
 *
 * Sixty seconds keeps the store effectively cached while making admin edits
 * show up on their own.
 */
export const CATALOGUE_REVALIDATE_SECONDS = 60

export const getCacheOptions = async (
  tag: string
): Promise<{ tags?: string[]; revalidate: number }> => {
  if (typeof window !== "undefined") {
    return { revalidate: CATALOGUE_REVALIDATE_SECONDS }
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return { revalidate: CATALOGUE_REVALIDATE_SECONDS }
  }

  return { tags: [`${cacheTag}`], revalidate: CATALOGUE_REVALIDATE_SECONDS }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}
