import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const REDIS_URL = process.env.REDIS_URL

/**
 * Redis-backed infrastructure modules. Medusa falls back to in-memory
 * implementations when REDIS_URL is unset, which is fine for a throwaway
 * local run but loses events and workflow state on restart.
 */
const redisModules = REDIS_URL
  ? [
      {
        resolve: '@medusajs/medusa/cache-redis',
        options: { redisUrl: REDIS_URL },
      },
      {
        resolve: '@medusajs/medusa/event-bus-redis',
        options: { redisUrl: REDIS_URL },
      },
      {
        resolve: '@medusajs/medusa/workflow-engine-redis',
        // Options nest under `redis`; `redisUrl` is the current key (`url` is deprecated).
        options: { redis: { redisUrl: REDIS_URL } },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: [
    ...redisModules,
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/payplus',
            id: 'payplus',
            options: {
              baseUrl: process.env.PAYPLUS_BASE_URL,
              merchantId: process.env.PAYPLUS_MERCHANT_ID,
              storeId: process.env.PAYPLUS_STORE_ID,
              apiKey: process.env.PAYPLUS_API_KEY,
              secretKey: process.env.PAYPLUS_SECRET_KEY,
              sandbox: process.env.PAYPLUS_SANDBOX !== 'false',
            },
          },
        ],
      },
    },
  ],
})
