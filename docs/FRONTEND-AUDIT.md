# Nyumba Frontend Loophole Audit

This audit intentionally separates frontend remediation from the backend hardening work.

## P0 — fix before real money or public production

1. **Purchase success can be shown even when lead submission fails.** `app/property/buy/[id].tsx` awaits `createLead(...)` but ignores its `{ ok, error }` result, then always navigates to the confirmed screen.
2. **Payment is not verified.** The user can tap "I've made payment" and the app records a lead; there is no payment provider, server-side invoice, webhook confirmation, idempotency protection or reservation transaction.
3. **Invoice reference is client-generated with `Math.random()`.** It is not authoritative, collision-resistant enough for financial use, or persisted server-side before display.
4. **Price/availability can change after the property is loaded.** The client calculates a 10% deposit from cached property data and does not revalidate status/price on the server when the invoice is generated/submitted.
5. **Supabase `User` is read as `user.name` / `user.phone` in the purchase screen.** Those are not standard Supabase User fields; the screen should use the loaded profile/user metadata.

## P1 — reliability and scale

1. **Several data-loading screens have `try/finally` but no `catch`.** Network/database errors can become unhandled promise failures with no retry/error state (search, property, agency, favorites and parts of Discover).
2. **No infinite scroll/load-more UI.** Backend reads are now deliberately capped/paginated; the UI must request subsequent pages when lists grow beyond the first page.
3. **Favorites can diverge between local and cloud state.** Remote failures are logged but optimistic local changes are not rolled back. A cloud result of zero favorites also does not clear stale local favorites.
4. **Favorites screen performs one request per favorite property.** A large saved list becomes N requests; replace with a batched `in(id, [...])` query or a paginated favorites join.
5. **Search has debounce but no request cancellation/latest-request guard.** A slower old request can overwrite a newer search result.
6. **Discover loads four datasets at once with `Promise.all`.** One failed request rejects the whole refresh. Use `Promise.allSettled`, per-section error states, or a server-composed discovery endpoint.
7. **No global error boundary / offline state was found for data failures.** Add retry actions and distinguish empty results from backend/network failures.

## P2 — UX/design

1. Listing counts shown in tabs can be misleading once pagination is active because `properties.length` is only the loaded page, not the total count.
2. Long agency/property text needs systematic truncation/accessibility checks on small screens and web breakpoints.
3. Image-heavy screens need explicit loading placeholders, failure fallbacks and CDN sizing to avoid bandwidth spikes.
4. Purchase copy currently tells users a direct deposit "secures this home" without a backend reservation/payment confirmation mechanism. The wording should match actual system guarantees.
5. Form validation should be centralized and consistent between native/web/server, particularly phone numbers, email, currency, image URLs and required property fields.

## Recommended next frontend pass

Address the P0 purchase flow first, then error/retry states, pagination, batched favorites, stale-request protection and image performance. After those, run accessibility and responsive-layout testing across iPhone/Android and web widths.
