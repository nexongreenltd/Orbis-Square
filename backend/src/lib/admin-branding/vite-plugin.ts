import { AUTH_THEME_CSS, AUTH_THEME_SCRIPT } from "./auth-theme"

/**
 * Injects the Orbis Square auth branding into the admin's index.html.
 *
 * Done at the document level rather than through a widget because the
 * reset-password route — the one a user reaches from an emailed link, with no
 * prior page load — exposes no injection zone at all.
 */
export function orbisAdminBranding() {
  return {
    name: "orbis-admin-branding",
    transformIndexHtml() {
      return [
        {
          tag: "title",
          children: "Orbis Square Admin",
          injectTo: "head",
        },
        {
          tag: "style",
          attrs: { "data-orbis": "auth-theme" },
          children: AUTH_THEME_CSS,
          injectTo: "head",
        },
        {
          tag: "script",
          children: AUTH_THEME_SCRIPT,
          injectTo: "head",
        },
      ]
    },
  }
}
