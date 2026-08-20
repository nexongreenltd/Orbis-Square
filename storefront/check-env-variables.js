const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
  {
    key: "MEDUSA_BACKEND_URL",
    // Without this the SDK silently falls back to http://localhost:9000, which
    // only fails much later — as an ECONNREFUSED while collecting page data.
    // Required for builds only, so local dev keeps working off the default.
    productionOnly: true,
    description:
      "The public URL of your Medusa backend, e.g. https://admin.orbissquare.com",
  },
]

function checkEnvVariables() {
  const isProduction = process.env.NODE_ENV === "production"

  const missingEnvs = requiredEnvs.filter(function (env) {
    if (env.productionOnly && !isProduction) {
      return false
    }

    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }
}

module.exports = checkEnvVariables
