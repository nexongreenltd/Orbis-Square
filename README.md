# Orbis Square

Robotics and technology parts shop for Bangladesh, built on Medusa v2 with a
Next.js storefront.

```
orbissquare/
├── backend/     Medusa 2.18 — admin, API, PayPlus payment provider
└── storefront/  Next.js 15 storefront (App Router, Tailwind)
```

## Running locally

Both apps expect Postgres and Redis on their default ports.

```bash
# Terminal 1 — API + admin on :9000
cd backend && npm run dev

# Terminal 2 — storefront on :8000
cd storefront && npm run dev
```

| What | Where | Credentials |
| --- | --- | --- |
| Storefront | http://localhost:8000 | — |
| Admin | http://localhost:9000/app | `tamim@bims.tech` / `OrbisSquare2026!` |

> **Note:** this shell exports `NODE_ENV=production`, which makes `npm install`
> silently skip devDependencies (and Medusa then can't load its TypeScript
> config). Always install with `NODE_ENV=development npm install --include=dev`.

### Resetting the catalogue

```bash
cd backend
NODE_ENV=development npx medusa db:migrate
NODE_ENV=development npm run seed
```

The seed creates the Bangladesh region (BDT), a Dhaka warehouse, three shipping
options (Inside Dhaka ৳60, Outside Dhaka ৳130, Same-Day Express ৳200), six
categories, twenty products and three bundled starter kits.

The kits carry their card content in `product.metadata` (`level`, `was`,
`items`), which the home page's "One box. Whole project." section reads.

The seed rewrites the publishable API key. After reseeding, copy the new key
into `storefront/.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`:

```bash
psql -U postgres -h localhost -d orbissquare -tA \
  -c "SELECT token FROM api_key WHERE type='publishable' AND revoked_at IS NULL LIMIT 1;"
```

## Theme

Taken from the Claude Design "Orbis Square Landing" reference: warm greys, a
vivid red-orange accent, Archivo, and square corners throughout.

| Role | Token | Value |
| --- | --- | --- |
| Accent | `orbis-600` | `#ec3013` |
| Accent (hover) | `orbis-700` | `#ae1800` |
| Text / darkest | `ink-900` | `#201e1d` |
| Muted text | `ink-500` / `ink-600` | `#7d7979` / `#605d5d` |
| Page background | `canvas` | `#f3f2f2` |
| Card surface | `canvas-surface` | `#eae9e9` |

The palette lives in two places:

- `storefront/tailwind.config.js` — the `orbis` (accent) and `ink` (neutral)
  ramps, the `canvas` surfaces, and a `borderRadius` scale where **every value
  is `0px`**, since the reference uses square corners everywhere.
- `storefront/src/styles/globals.css` — remaps the `@medusajs/ui` CSS variables,
  which re-skins every Medusa UI button, input and badge at once. Also defines
  the `.eyebrow` label (small uppercase text with a square accent marker) used
  above section headings.

Type is Archivo, loaded via `next/font/google` in `src/app/layout.tsx` and
exposed as `--font-archivo`; headings run at weight 800.

### Home page sections

Ported from the reference design, in order: hero (with the "most bought this
month" card and trending chips), brand strip, "Shop by category", "Landed this
week" (New Arrivals collection), "One box. Whole project." (Starter Kits
collection), customer reviews, bulk-order enquiry, trust strip, footer.

Stock counts, prices and products come from Medusa rather than the design's
sample numbers.

> **Before launch:** the reviews in
> `src/modules/home/components/reviews/index.tsx` — and the "4.8 / 5 from 1,240
> orders" rating above them — are placeholder copy from the design mock, not
> real customers. Replace them with genuine reviews or delete the section;
> publishing invented testimonials is misleading and unlawful in many markets.
> The "142 sold" figure in the hero card is likewise hard-coded.

Product imagery is placeholder SVG generated into `storefront/public/products/`
in the same palette. Replace it with real photography through the admin; the
logo is still to come and currently renders as an "O" tile in the nav, drawer
and footer.

## PayPlus payment provider

Registered as `pp_payplus_payplus` and enabled for the Bangladesh region
alongside `pp_system_default` (used here as cash on delivery).

```
backend/src/modules/payplus/
├── client.ts    HTTP adapter — the only file that knows PayPlus' wire format
├── service.ts   Medusa AbstractPaymentProvider implementation
└── types.ts     Normalised session/status shapes
```

The Medusa-side wiring is complete: the provider implements all ten required
methods, models PayPlus as a redirect gateway (returning
`pending_authorization` until the gateway confirms), and Medusa's built-in
webhook endpoint is used rather than a hand-rolled route.

**The gateway-specific details are not yet verified.** Every unconfirmed value
in `client.ts` is marked with a `CONFIRM` comment. Before going live, check
these against the PayPlus documentation:

1. **Endpoint paths** — `ENDPOINTS` at the top of `client.ts`.
2. **Authentication** — currently `Authorization: Bearer <apiKey>`; PayPlus may
   want `x-api-key`, or credentials inside the JSON body.
3. **Request field names** — the `createSession` payload.
4. **Response field names** — transaction reference and hosted-checkout URL, in
   `toSession`.
5. **Status vocabulary** — `normaliseStatus`.
6. **Webhook signature scheme** — `verifyWebhookSignature` implements
   HMAC-SHA256 over the raw body. Many Bangladeshi gateways instead hash a
   specific field concatenation plus a store passphrase. Unsigned callbacks are
   rejected, so this must be correct before webhooks will settle orders.
7. **Webhook header** — the header carrying the signature, in
   `getWebhookActionAndData`.
8. **Capture semantics** — the code assumes hosted-checkout payments settle on
   PayPlus' side. If PayPlus supports separate auth-then-capture, add the
   capture call in `capturePayment`.

### Configuration

Fill these into `backend/.env`:

```
PAYPLUS_BASE_URL=
PAYPLUS_MERCHANT_ID=
PAYPLUS_STORE_ID=
PAYPLUS_API_KEY=
PAYPLUS_SECRET_KEY=
PAYPLUS_SANDBOX=true
```

Until they are set the store still boots — the provider logs a warning at
startup and only throws if a customer actually selects PayPlus at checkout.

### Callback URLs

Built from `STOREFRONT_URL` and `BACKEND_URL` in `backend/.env`. Register these
with PayPlus:

| Purpose | URL |
| --- | --- |
| Return / success | `http://localhost:8000/payplus/return` |
| Cancel / failure | `http://localhost:8000/payplus/return?status=cancelled` |
| IPN webhook | `http://localhost:9000/hooks/payment/payplus_payplus` |

For local webhook testing, expose port 9000 with a tunnel (ngrok or similar)
and set `BACKEND_URL` to the public host.
