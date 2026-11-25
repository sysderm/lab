# NO REFUNDS – Original Receipt fulfillment

Draft integration; do not enable live checkout until the release gate below passes.
The existing free calculator and A3 poster remain in place. This adds a separate 4 × 16 inch (10.16 × 40.64 cm) product at /norefunds/receipt/. Main site shows its link only when the bridge reports enabled.

## Verified account configuration

- Zazzle product template 256629092171840156, 5% royalty, 4 × 16 in custom satin print.
- API-generated link: https://www.zazzle.com/api/create/at-238446053942729400?pd=256629092171840156&ed=false&ax=Linkover&tc=NoRefunds&t_receipt_iid=https%3A%2F%2Fkonsil.ch%2Fnorefunds%2Fog.png
- The owner's browser test replaced the template artwork and preserved the custom size. The social preview og.png had the wrong aspect ratio, as expected. The new renderer uses 1800 × 7200 pixels (450 pixels per inch at 4 × 16 in).
- Ownership setting must be user-owned content (not a copy into the seller's image album). Confirm domain declaration for konsil.ch.
- Do not add rf= or alter the account-generated link without confirming attribution.
- Do not assume 40% self-promotion earnings: the agreement refers to public products incorporating the creator's primary content; this template is direct-only and includes user-provided imagery. Confirm actual eligibility, including the API-generated at-ID, with Zazzle api.help@zazzle.com. The 5% displayed creator royalty is not a guaranteed net payout, either.
- Owner saw $5.85 list + $5.48 shipping to Switzerland in US checkout, $11.33 total without the temporary sale. Not a guaranteed future price or shipping quote.

## Architecture

1. Browser-only Canvas 1800 × 7200. No photograph is transferred until the customer gives explicit permission and clicks the order button. Generated artwork includes only the chosen name, age, optional portrait, chosen period and design. No birth date, address, payment or order data is collected. Photo metadata is not copied by canvas. A no-photo monogram alternative is available.
2. Cloudflare Turnstile loads only after explicit order consent. Server validates action and hostname; per-IP rate limit, size limit and strict structural PNG header/chunk checks. These checks do not constitute full image decoding or content moderation. Before public launch, decide whether further sanitization/re-encoding, moderation or cost controls are needed.
3. Worker stores the print in a private R2 bucket under a cryptographically random token. Its unlisted HTTPS URL on konsil.ch is a bearer link accessible to anyone who has it. Read access expires in 24 hours; R2 lifecycle is required for automatic physical deletion (may occur later than expiration). No URL contains customer names. Do not log request contents or full image URLs; check platform-level logs, analytics and retention. Zazzle may retain its own copy.
4. Worker creates the Zazzle link using URLSearchParams. Browser redirects to Zazzle after confirming destination/template. No payment integration, order database, or fulfillment webhooks needed.

## Deployment (requires existing Cloudflare and site deployment access)

Review current local aico/lab checkout, including the previous uncommitted poster redesign. Merge/cherry-pick this separate branch without replacing that work; no production deployment from this draft.
Confirm konsil.ch is a proxied Cloudflare hostname and the proposed narrow route does not conflict with the current static hosting. Deploy the static page using the existing site workflow. Keep the receipt link hidden by leaving CHECKOUT_ENABLED=false.
In this directory, use Wrangler >=4.36. Confirm rate-limit namespace is unused in the account:
- Create private R2 bucket norefunds-receipt-temp. Disable public r2.dev and public custom-domain access.
- Add an expiration rule for all objects in this dedicated bucket at 1 day (R2 lifecycle). Confirm it exists; read expiry is enforced separately in Worker.
- Create Turnstile widget for konsil.ch, with action receipt_checkout in the client. Set public site key in wrangler.toml and store secret using wrangler secret put TURNSTILE_SECRET. Never commit secrets.
- Deploy Worker with false flag. Verify config reports disabled, free generator unchanged, and direct receipt page works for download.
- Configure abuse monitoring and cost alerts, appropriate privacy disclosures, and R2/log retention. Ensure no clinical data is entered. Confirm with Zazzle that expiry is sufficient for checkout/production and that they copy artwork instead of requiring a live URL later.
- For controlled end-to-end testing, use a restricted staging/preview arrangement or enable the endpoint briefly under controlled access with the public button still hidden. Do not route public customer traffic until tested. Test with fictional names and a synthetic portrait only. Then enable CHECKOUT_ENABLED=true and deploy after sign-off.
- If there is a problem, set CHECKOUT_ENABLED=false and redeploy (new checkout hidden/blocked, existing images accessible only until their expiry). Restore previous static deployment if needed.

## Release acceptance checklist

- [ ] npm/node test: run node --test worker.test.mjs from this directory; verify the API URL preserves all parameters and image URL decoding.
- [ ] Visual test in Safari/iOS/Chrome; actual 1800x7200 PNG, long names, ages 1/120, EN/DE, all time periods, photo and no-photo, crop and low-res handling, no text clipped; compare to approved 4×16 artwork. Ensure mobile memory acceptable, no external traffic before consent other than same-origin config request. Inspect actual printed proof.
- [ ] Test invalid dimensions, corrupted and oversized upload, missing/wrong-origin token, missing configuration, rate limit, expiration, inaccessible expired images, failed storage and network retry/cancel. Verify cleanup, no public bucket, no leaked secrets or personal data in logs.
- [ ] Test Zazzle replacement with an actual generated portrait receipt (not og.png). Verify entire design, no cropping, actual print size, no duplicate order. Test anonymous customer/Swiss locale and mobile, customer can still finish checkout before link expiration.
- [ ] Verify attribution and earnings in Ambassador Center/Linkover History and on a legitimate test order; confirm whether the public-product/primary-content requirements and user-owned image setting affect commission. Do not make a purchase without owner approval.
- [ ] Set enabled only after successful controlled end-to-end verification, privacy review and owner approval.

Official docs: https://www.zazzle.com/api ; https://www.zazzle.com/terms/ambassadors_agreement ; https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ ; https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
