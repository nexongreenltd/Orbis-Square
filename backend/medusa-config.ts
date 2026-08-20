import { loadEnv, defineConfig } from '@medusajs/framework/utils'

import { orbisAdminBranding } from './src/lib/admin-branding/vite-plugin'

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

/**
 * S3-compatible file storage, pointed at Cloudflare R2 in production. Without
 * it Medusa writes uploads to local disk, which survives on a VPS volume but is
 * lost on any host with an ephemeral filesystem. Falls back to local storage
 * when unconfigured so `medusa develop` needs no cloud credentials.
 *
 * Gated on the credentials rather than the bucket name: .env.production.template
 * ships a bucket name pre-filled, so keying on that alone registers the provider
 * before keys exist and the server crash-loops on "Access key ID and secret
 * access key are required".
 */
const hasS3Credentials = Boolean(
  process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET
)

const fileModule = hasS3Credentials
  ? [
      {
        resolve: '@medusajs/medusa/file',
        options: {
          providers: [
            {
              resolve: '@medusajs/medusa/file-s3',
              id: 's3',
              options: {
                file_url: process.env.S3_FILE_URL,
                access_key_id: process.env.S3_ACCESS_KEY_ID,
                secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                bucket: process.env.S3_BUCKET,
                endpoint: process.env.S3_ENDPOINT,
                // R2 has no notion of regions but the AWS SDK demands one.
                region: 'auto',
              },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  admin: {
    /**
     * The login, reset-password and invite screens ship inside the pre-built
     * dashboard bundle. This injects the Orbis Square theme into the admin's
     * index.html so the branding also covers a cold load of the reset link,
     * which no widget zone can reach.
     */
    vite: (config) => ({
      ...config,
      plugins: [...(config.plugins ?? []), orbisAdminBranding()],
    }),
  },
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
    ...fileModule,
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
