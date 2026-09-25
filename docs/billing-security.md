# Billing and recovery deployment requirements

## Billing

- Apply `supabase/migrations/2026092402_billing_webhooks.sql` before deploying handlers. It intentionally fails if existing profiles share a Stripe customer ID; investigate duplicates rather than merging identities automatically.
- Required server environment: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `NEXT_PUBLIC_SITE_URL` must be an explicitly trusted origin (production default `https://ermajean.com`; set localhost origin for local development). Never use request Origin/Host as the return URL authority.
- Production checkout catalog is exactly yearly `price_1QWp6pEl9PRnOeq5BdPuTmWU` and monthly `price_1S1vPoEl9PRnOeq5lBf7pBbo`. Test and historical IDs are not entitled. Audit existing subscribers before release; explicitly add verified grandfathered products if needed. Unknown paid IDs have zero generation allowance.
- Subscribe the Stripe endpoint to checkout completed/async-payment-succeeded, subscription created/updated/deleted, invoice paid/payment_failed.
- Signed events acquire a fenced per-customer lease, retrieve all current subscriptions, then atomically update profile and record completion. Only active/trialing known products grant access. A cancellation for an older subscription cannot revoke a different current subscription. Past-due/unpaid/canceled subscriptions do not grant access.
- A database/network failure returns 503 without a completion marker. Concurrent customer reconciliation returns 503 for provider retry. Expired workers cannot commit under a replaced token. Permanent mapping/configuration problems require operator attention and Stripe event redelivery after repair. Do not clear successful event IDs during replay.
- Authenticated checkout session lookup returns only completion/payment/access flags, never customer email; it verifies user/client-reference or the server-managed profile customer mapping. Checkout UI waits for webhook-confirmed access.
- No Stripe writes, webhook deployment, or production database migrations were run during implementation.

## Auth recovery

The callback accepts only exact local kitchen/recipes/reset routes and `ermajean://reset-password`. Configure the matching Supabase redirect allowlist. Native PKCE codes are forwarded to the originating native application for exchange; browser PKCE codes are exchanged on the server. Invalid or expired browser codes return to sign-in. Recovery emails use the trusted configured site origin; caller-supplied callback redirects are ignored.

## Inbound email

Mailgun inbound forwarding is disabled with HTTP 503. This intentionally prevents unsigned requests from sending mail and disables all replay exposure. Do not enable until a reviewed recipient, HMAC signature verification, timestamp window, durable replay ledger, and delivery retry strategy exist. All template ShipFast sender/support/forwarding addresses were removed. Outbound `sendEmail` refuses to send without `MAILGUN_API_KEY`; configure and verify the ErmaJean sending domain before use.

## Validation

`npx tsx --test tests/billing.test.ts`: catalog fail-closed, redirect allowlist, checkout ownership, current subscription reconciliation, duplicate/busy events, failed commit release and retry. Database lease SQL requires staging integration testing with concurrent delivery and forced failure before production migration; no local Postgres instance was available for this test.

References: [Stripe webhook ordering and duplicate handling](https://docs.stripe.com/webhooks), [Mailgun webhook signature specification](https://documentation.mailgun.com/docs/mailgun/user-manual/webhooks/securing-webhooks).
