/**
 * Orbis Square branding for the admin's unauthenticated pages — login, reset
 * password, and accepting an invite.
 *
 * These routes are part of the pre-built `@medusajs/dashboard` bundle, so they
 * cannot be replaced with our own components: the only widget zone on any of
 * them is `login.before`, and the reset-password route has none at all. A
 * customer arriving from an emailed reset link loads that route directly, so
 * anything injected from a widget would miss the page that matters most.
 *
 * Instead this is injected into the admin's `index.html` at build time (see the
 * `admin.vite` hook in medusa-config.ts), which covers every route including a
 * cold load.
 *
 * The dashboard is built on @medusajs/ui, which reads its colours from CSS
 * variables — the same token names the storefront remaps in globals.css. So the
 * bulk of this is a token remap rather than a fight with utility classes. It is
 * scoped to `html[data-orbis-auth]` (set by the script below) so the dense
 * authenticated screens keep the stock Medusa palette.
 */

const INK = "#201e1d"
const INK_600 = "#605d5d"
const INK_500 = "#7d7979"
const INK_200 = "#d7d3d3"
const RULE = "#e6e3e3"
const CANVAS = "#f3f2f2"
const SURFACE = "#eae9e9"
const ACCENT = "#ec3013"
const ACCENT_HOVER = "#ae1800"

/** The Orbis Square mark, matching storefront `modules/common/icons/logo.tsx`. */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="1" y="1" width="62" height="62" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="32" cy="32" r="19" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="32" cy="13" r="5.5" fill="${ACCENT}"/></svg>`

const markUrl = `url("data:image/svg+xml,${encodeURIComponent(MARK)}")`

export const AUTH_THEME_CSS = /* css */ `
html[data-orbis-auth] {
  /* @medusajs/ui tokens — remapped to the storefront palette. */
  --bg-base: ${CANVAS};
  --bg-subtle: ${CANVAS};
  --bg-component: ${SURFACE};
  --bg-field: #ffffff;
  --bg-field-hover: #ffffff;

  --fg-base: ${INK};
  --fg-subtle: ${INK_600};
  --fg-muted: ${INK_500};
  --fg-interactive: ${ACCENT};
  --fg-interactive-hover: ${ACCENT_HOVER};

  --border-base: ${INK_200};
  --border-strong: ${INK};

  --button-inverted: ${ACCENT};
  --button-inverted-hover: ${ACCENT_HOVER};
  --button-inverted-pressed: ${ACCENT_HOVER};
  --button-neutral: ${SURFACE};

  --contrast-fg-primary: #ffffff;
}

/* The design is square throughout; the dashboard rounds nearly everything. */
html[data-orbis-auth] .min-h-dvh :is(input, button, a, div, h1) {
  border-radius: 0 !important;
}

html[data-orbis-auth] .min-h-dvh {
  background-color: ${CANVAS};
  background-image:
    linear-gradient(${RULE} 1px, transparent 1px),
    linear-gradient(90deg, ${RULE} 1px, transparent 1px);
  background-size: 64px 64px;
  background-position: center;
}

/* Lift the auth column onto a hard-bordered card, like the storefront panels. */
html[data-orbis-auth] .min-h-dvh > div {
  max-width: 400px !important;
  padding: 40px 36px 24px;
  border: 1px solid ${INK};
  background-color: ${SURFACE};
}

/* Swap the Medusa avatar/logo box for the Orbis mark. */
html[data-orbis-auth] .min-h-dvh > div > div:first-child {
  width: 56px !important;
  height: 56px !important;
  background: ${markUrl} center / contain no-repeat !important;
  box-shadow: none !important;
}
html[data-orbis-auth] .min-h-dvh > div > div:first-child > * {
  display: none !important;
}
html[data-orbis-auth] .min-h-dvh > div > div:first-child::after {
  display: none !important;
}

/* Heading and hint pick up the storefront's heavy, tight display type. */
html[data-orbis-auth] .min-h-dvh h1 {
  font-weight: 800 !important;
  letter-spacing: -0.02em;
  font-size: 26px !important;
  line-height: 1.15 !important;
  color: ${INK};
  text-align: center;
}
html[data-orbis-auth] .min-h-dvh h1 + p {
  margin-top: 6px;
  color: ${INK_600} !important;
}

html[data-orbis-auth] .min-h-dvh input {
  height: 44px;
  border: 1px solid ${INK_200} !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
  color: ${INK};
}
html[data-orbis-auth] .min-h-dvh input:focus {
  border-color: ${ACCENT} !important;
  box-shadow: none !important;
}

/* The single primary action on each page carries the accent. */
html[data-orbis-auth] .min-h-dvh button[type="submit"],
html[data-orbis-auth] .min-h-dvh form button:not([type="button"]) {
  height: 44px;
  background-color: ${ACCENT} !important;
  color: #ffffff !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  box-shadow: none !important;
}
html[data-orbis-auth] .min-h-dvh form button:not([type="button"]):hover {
  background-color: ${ACCENT_HOVER} !important;
}
html[data-orbis-auth] .min-h-dvh form button::after {
  display: none !important;
}
html[data-orbis-auth] .min-h-dvh form button:disabled {
  background-color: ${INK_200} !important;
  color: ${INK_500} !important;
}

html[data-orbis-auth] .min-h-dvh a {
  color: ${ACCENT} !important;
  font-weight: 700;
}
html[data-orbis-auth] .min-h-dvh a:hover {
  color: ${ACCENT_HOVER} !important;
}
`

/**
 * Flags the unauthenticated routes on <html> so the CSS above can scope to
 * them. Runs on load and after client-side navigation — the dashboard is a
 * single-page app, so pathname changes never reload the document.
 */
export const AUTH_THEME_SCRIPT = /* js */ `
(function () {
  var AUTH = ["/login", "/reset-password", "/invite"];
  function apply() {
    var path = window.location.pathname.replace(/\\/+$/, "");
    var isAuth = AUTH.some(function (p) {
      return path === p || path.endsWith(p);
    });
    if (isAuth) {
      document.documentElement.setAttribute("data-orbis-auth", "");
    } else {
      document.documentElement.removeAttribute("data-orbis-auth");
    }
  }
  ["pushState", "replaceState"].forEach(function (name) {
    var original = history[name];
    history[name] = function () {
      var result = original.apply(this, arguments);
      apply();
      return result;
    };
  });
  window.addEventListener("popstate", apply);
  apply();
})();
`
