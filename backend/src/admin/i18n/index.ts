import en from "./json/en.json"

/**
 * Merged over the dashboard's built-in translations, so these keys rebrand the
 * pre-built login, reset-password and invite screens without patching the
 * bundle. See `populateI18n` in @medusajs/dashboard.
 */
export default {
  en: {
    translation: en,
  },
}
