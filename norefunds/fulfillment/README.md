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

## Deployment inspection — 2026-11-25

**Release blocked; no production deployment, purchase or paid plan activated.**

- Clean initial checkout: `feature/norefunds-zazzle-receipt` at `5570cca`, matching Draft PR #1. No pre-existing uncommitted changes were present. Existing calculator and poster files were preserved.
- Wrangler 4.168.0 authenticated successfully after owner-authorized OAuth. Account: `de34349a62264b11e35bde32778a54e1`. Never include its OAuth token in reports or commits.
- R2 API returns code 10042, “Please enable R2 through the Cloudflare Dashboard”. Therefore no bucket, lifecycle or remote privacy settings have been provisioned or verified. Owner activation is pending because R2 may require billing enrollment.
- `konsil.ch` is **not a Cloudflare zone in this account**. Public DNS uses `ns1.domains.ch` / `ns2.domains.ch`; A record `187.124.4.207`. HTTPS responds from nginx/1.29.8; API config path returns 404. The proposed zone route cannot currently work. The existing Cloudflare Pages project `the-till` has no custom domains and is not evidence of the live konsil.ch deployment path. Do not publish to that Pages project assuming it updates konsil.ch.
- Free managed Turnstile widget `NO REFUNDS receipt` created for `konsil.ch`, with `no_clearance`. Its public key is in `wrangler.toml`. Secret is stored only in ignored, mode-0600 `.dev.vars` on this checkout, pending `wrangler secret put TURNSTILE_SECRET` once the deployment target is resolved. Do not commit it or copy it into a static artifact.
- Browser account access unavailable (`browser access host is unavailable`): Ambassador Center, domain declaration, user-owned image setting and Linkover History remain unverified. No commission or earnings claim has been confirmed.

### Reproducible checks

From this directory: `npm ci`, `npx playwright install chromium webkit`, `npm test`, `npm run test:browser`, `npm run check:deploy`.
Browser QA writes disposable screenshots and PNGs to ignored `.qa/` (override with `QA_OUTPUT`). It serves local HTML through intercepted test requests, uses fictional names and a synthetic portrait, and never contacts actual Zazzle or Turnstile. This is a client simulation, **not** proof of Zazzle import or real bot verification.

- Worker suite: 11 passing cases covering exact account link/encoding, malformed PNG and checksum, disabled/incomplete config, expired image, origin/rate limits, mocked valid upload and private GET/HEAD, Turnstile failures/hostname/action, malformed/oversized body, safe storage/network errors.
- Browser matrix: Chromium desktop, WebKit desktop, WebKit iPhone 13 emulation; EN/DE × ages 1/120 × periods 5/10/20/30 (48 combinations). Portrait, no-photo monogram, long name, 1800×7200 export/download, low-resolution rejection, layout bounds and no external requests before consent checked. Retry/cancel/redirect use mocks. WebKit emulation does not replace physical Safari/iOS device and memory testing. Screenshots reviewed for the long German name and age 120. Actual printed proof still required.
- Wrangler deployment dry-run passes with checkout disabled. It validates bundling/config syntax, **not** remote bucket, route or rate-limit namespace availability.
- PNG checks include chunk bounds, CRCs, header methods and critical-chunk handling. They still do not decode/re-encode or moderate content. Benchmark maximum-size uploads on the chosen Worker plan before launch; Free has a 10 ms CPU budget, which may be too small for CRC processing of large PNGs. Do not silently upgrade to Paid.

### Privacy, security and costs before release

The image contains the selected name, age and portrait; treat even the random image URL as private bearer access. The browser photo is not uploaded until consent and submit. Server expiration denies reads after 24 hours, but physical R2 lifecycle deletion is asynchronous, typically within 24 hours after expiration and sometimes later. Do not promise physical erasure exactly at 24 hours. Zazzle retention is independent. Complete the site's controller/contact disclosure and review Cloudflare/Zazzle processing and international transfers before collecting real personal data.

Do not enable invocation logs or request tracing containing full URLs: the token is part of the image path. Verify Cloudflare account-level analytics, proxy access logs, error reporting and retention too. Disable raw path/access logging for any future nginx image proxy; local code avoiding `console.log` alone is insufficient.

Official prices checked on 2026-11-25:

- [R2 Standard](https://developers.cloudflare.com/r2/pricing/): monthly free allowance 10 GB-months, 1 million Class A and 10 million Class B operations, shared account-wide. Beyond that: $0.015/GB-month, $4.50/million Class A, $0.36/million Class B, no egress fee. Do not select Infrequent Access for one-day images. A one-day lifecycle limits retention, not total costs.
- [Workers](https://developers.cloudflare.com/workers/platform/pricing/): Free includes 100,000 requests/day and 10 ms CPU per invocation. Paid starts at $5/month plus overages and is not authorized. Existing account plan and alerts still need verification. A Workers spending limit does not cap R2 charges.
- [Turnstile](https://developers.cloudflare.com/turnstile/plans/): Free supports 20 widgets and unlimited verification requests. No Enterprise subscription was selected.
- Five uploads/minute/IP is not a global cap: distributed abuse and repeated GET/HEAD requests can consume storage and request allowances. Configure account usage alerts and choose an acceptable budget/abuse response before enabling the public checkout.

### Remaining release gates

1. Owner completes any R2 enrollment; create a private dedicated Standard bucket, verify r2.dev/custom domains disabled, apply a one-day lifecycle and read it back.
2. Resolve hosting architecture with owner: narrow proxy on existing nginx or a separately authorized Cloudflare DNS migration. No DNS, nginx or production route was changed during this inspection.
3. Deploy a controlled bridge, upload the Turnstile secret without exposing it, verify unique rate-limit namespace and platform logs/alerts. Keep public checkout disabled. Restrict testing access, including the upload endpoint.
4. Send a real generated synthetic portrait receipt through the actual bridge to Zazzle; verify 4×16 inches, complete uncropped artwork, anonymous/Swiss and mobile paths, retries, no duplicate order, and image availability for production after URL expiry. **Not performed yet.**
5. Inspect Ambassador Center/Linkover History using the signed-in owner browser. The preserved `at-238446053942729400` link is structurally tested; this does not prove attribution, eligibility or payout. [Agreement sections 2–4](https://www.zazzle.com/terms/ambassadors_agreement) distinguish public products/primary content, tracking and completed sales. Paid test order and printed proof require separate owner approval; no email to Zazzle has been sent.
6. Obtain explicit owner live-release approval only after the above checks; then deploy static files through the confirmed existing workflow and enable checkout. Keep rollback ready: false flag and redeploy; existing bearer images remain subject to their original expiration.


### Owner-selected nginx proxy preparation

Owner selected the narrow proxy on 2026-11-25; **preparation only, no activation**. `wrangler.proxy.toml` and `proxy/` implement this path. The original zone-route config remains available for a separately approved DNS migration, but must not be used with the current hosting.

Read-only SSH via documented `vps` fallback succeeded after MagicDNS name `hostinger` failed. Confirmed `/opt/AGENTS.md`, existing `/opt/thetill/docker-compose.yml`, public root `/opt/thetill/public`, container `thetill`, read-only static mount, host-network Traefik, existing external network `traefik-proxy` gateway `172.19.0.1`. No files or services on the VPS were modified. Production calculator SHA256 `5ef5f8e3e565fe3f7d297494a89323656156a26aed92e33bd3b4e82eab2baaa8`; poster `f90182b7c2d24d1e57cbb48bd2d8fc55fa471286e01bed26c6e1bf3fbbfc2bfb`. Preserve these and any newer changes during release; do not copy the repository wholesale to the public root, as that would also expose source/configuration files.

The dedicated proxy template follows host rules: unique container/router/service, priority 2000, existing external network, no exposed ports, no modification to shared Traefik or storefront. It forwards only the exact receipt API prefix via the Traefik rule and preserves the URI. TLS verification is enabled. A random shared secret authenticates nginx to the Worker; direct workers.dev calls are rejected in proxy mode. The Worker uses only the nginx-overwritten client-IP header for rate limiting in this mode. Proxy config fails closed without a secret of at least 64 characters. Do not use the example placeholder as a secret.

Before deployment: establish the account workers.dev subdomain (API currently reports none), fill the upstream hostname, generate a unique 32-byte secret, store it as Worker `PROXY_SHARED_SECRET` and private proxy `.env` (0600), upload `TURNSTILE_SECRET` with `--config wrangler.proxy.toml`, and confirm account-level invocation logging is disabled. Keep `CHECKOUT_ENABLED=false`.

Before **activation**, inspect the actual Traefik forwarded-header trust and peer IP: nginx only trusts the confirmed Docker gateway and overwrites inbound proxy headers. Test that clients cannot spoof their IP or shared secret; review Traefik/global access logs too. Run Compose config validation and `nginx -t` in an isolated container without production routing. Compose validation with fictional values passes. The rendered nginx configuration passes `nginx -t` in an isolated, network-disabled disposable container on the host (no production mounts or ports); upstream reachability and TLS/forwarded-header behavior still require integration testing. A live compose-up is not authorized. Static release should copy only the reviewed receipt HTML and narrowly merge the existing calculator CTA; the poster stays untouched. A separate owner-approved controlled testing route is needed before real Zazzle import.


### Provisioning update — 2026-11-25 after owner R2 activation

R2 activation was completed by the owner. The earlier R2/subdomain/Worker provisioning blockers above are now resolved; the original inspection remains as history.

- Created `norefunds-receipt-temp`, Standard storage, location hint WEUR (a hint, not an EU jurisdiction guarantee). Verified `expire-receipts` enabled for all prefixes with one-day expiration. Default seven-day incomplete multipart cleanup remains enabled.
- Read back public-access settings: r2.dev **disabled**, no custom domains. Private bucket binding is present on the deployed Worker.
- Deployed `wrangler.proxy.toml` to `https://norefunds-receipt-bridge.norefunds-receipt-fulfillment.workers.dev`. Wrangler registered the account subdomain. Checkout remains **false**, proxy mode **true**, preview URLs disabled. No konsil.ch route, static content or nginx service was changed.
- `TURNSTILE_SECRET` and a new random 32-byte `PROXY_SHARED_SECRET` are installed as Worker secrets. They are also protected in ignored 0600 `.dev.vars`; the prepared local proxy `.env` is ignored/0600 and has not been copied to the server. Only names, not secret values, were used in verification output.
- Cloudflare API confirms the R2 and rate-limit bindings, secret bindings, `logpush=false`, no tail consumers; observability is explicitly disabled in deployment config. The account Worker list contained only this bridge, so its rate-limit namespace is not shared with another existing Worker. Global/proxy logging and alerting still require review before public use.
- Remote smoke tests passed: unauthenticated config returns 404; authenticated config returns `{enabled:false}`; authenticated POST remains blocked with 503; nonexistent image returns 404. TLS was verified using the freshly resolved DNS address while macOS retained an initial negative DNS cache entry.
- A real synthetic 1800×7200 portrait receipt was written to and read from R2 with identical SHA256, then the disposable object was removed. This confirms storage access, not the full consent/Turnstile/Zazzle upload flow. No real customer data was used. Lifecycle rule readback is verified; elapsed-day physical deletion has not yet been observed.
- Billing subscriptions API shows `R2 Paid` with **price 0 USD/month**, the R2 usage-billing enrollment, and a Cloudflare Free zone plan. No Workers Paid subscription was listed. No paid Workers plan was purchased. R2 overage charges remain possible; no global R2 spending cap or account alert has been configured.

Still blocked: browser access host remains unavailable, so Zazzle account attribution and actual import cannot be checked. The production proxy remains preparation-only as requested. Before a real Zazzle test, establish a restricted staging arrangement whose config/public button stays disabled; do not expose an enabled upload endpoint merely to test it. Owner approval is still required for live activation or any paid order. Maximum-size PNG CPU suitability on Workers Free, actual Turnstile behavior, global logs, cost alerts and physical-device/printed proof remain acceptance gates.

### Owner-provided Ambassador Center evidence — 2026-11-25

The owner pasted the Ambassador Center account view. It shows Ambassador ID `238446053942729400`, exactly matching `worker.mjs` and the account-generated API link. This confirms the account ID association from owner-supplied evidence; it was not independently observed through browser control.

The supplied page advertises self-promotion for the owner's public products/Create-a-Product API pages without adding referral parameters, and says links with `?rf=238446053942729400` are cross-promotion links eligible for 15% referral commission. Preserve the account-generated `at-` API link and do not add `rf=`. The advertised 35–50% self-promotion range does not establish eligibility or payout for this direct-only template containing user-generated imagery. Actual Linkover History, domain declaration, image ownership setting and qualifying-sale attribution remain unverified. No order was placed.

Owner-provided Linkover History baseline (2026-11-25): `Total Linkovers: 0`, date/click table `[none]`. No tracked referral click is evidenced yet. This does not establish a configuration defect or successful attribution. The subsequent Store Link page is a generic store-referral builder, not the personalized Create-a-Product API configuration; no store link was generated or substituted.

Owner-provided Declare Your Domains view (2026-11-25): `Your Domains: konsil.ch` confirms the intended image hostname is listed. The pasted text contains both content-ownership options but does not reveal the selected radio button or whether changes were saved. User-owned content mode remains unverified until the owner confirms the second option is selected and saved. Do not add the private workers.dev backend as an image domain; generated production artwork links use konsil.ch.

Owner confirmed saving the second, user-owned content option after the domain view above. Ownership setting is now owner-confirmed saved (not independently inspected through browser automation).

Owner-generated Create-a-Product API link (2026-11-25):
`https://www.zazzle.com/api/create/at-238446053942729400?pd=256629092171840156&ed=false&ax=Linkover&t_receipt_iid=9b518b77-0165-48e1-9680-eafec223d37e&tc=NoRefunds`

This confirms the account-generated at-ID, template ID, `ed=false`, `ax=Linkover`, tracking code and exact image parameter `t_receipt_iid` used by the Worker. Query parameter order is immaterial. The current UUID is a Zazzle internal image ID, not an uploaded synthetic receipt or temporary HTTPS artwork URL. For the actual receipt flow the Worker replaces only the image value with the expiring konsil.ch image URL. A click/import and Linkover History change have not yet been observed; eligibility/payout remain unverified. The owner was instructed not to click the placeholder test link yet.

### Technical proxy activation — 2026-11-25, explicitly owner-approved

After reviewing the prepared proxy, the owner authorized its technical activation while checkout remains disabled. Created `/opt/norefunds-receipt-proxy` with private mode-0600 config/secret files and started only the new `norefunds-receipt-proxy` container. Existing storefront, shared Traefik, DNS and other services were not modified. No customer-facing checkout was enabled and no order was placed.

Traefik is version 3.6.9 and global raw access logging is enabled. Added the supported per-router `observability.accesslogs=false` label only for the new receipt router (see https://doc.traefik.io/traefik/reference/routing-configuration/other-providers/docker/). The new nginx keeps redacted method/status/byte-count logs; recent raw Traefik log inspection found zero entries for this router and its dedicated logs contained no image paths. This is a scoped privacy setting, not a change to shared logging. Unrelated historical logs were not altered or disclosed.

Initial curl requests returned 502; allowing a certificate-chain verification depth of three resolved the TLS upstream connection without disabling certificate verification. Suppressed upstream NEL/Report-To/Alt-Svc headers and duplicate security headers on the new proxy. `nginx -t` passes and the config endpoint now returns HTTP 200 `{enabled:false}`. POST remains blocked with 503. Supplied untrusted proxy-secret headers are overwritten by nginx; actual rate-limit IP behavior still needs an enabled, restricted upload test.

A synthetic browser-rendered 1800×7200 portrait receipt was seeded into private R2 through an authenticated Wrangler remote binding with the same expiry metadata used by the bridge. Its unlisted image URL expires on 2026-11-26 at 10:35:48 UTC (11:35:48 Switzerland). A separate already-expired fixture was used to verify denial. Public curl GET and HEAD succeed for the live fixture, SHA256 matches the local PNG, private/no-store headers are present, and the expired fixture returns 404. Config and static calculator/poster checks pass; their deployed hashes remain unchanged. No full image URLs or tokens are recorded here or committed.

Initial Python urllib requests received Cloudflare 403/error 1010 while curl succeeded. The proxy now sends its own truthful `NO-REFUNDS-Receipt-Proxy/1.0` User-Agent instead of forwarding visitor/client fingerprints; subsequent Python config and exact-image fetches pass. Fresh Chromium config/image fetches also pass. The actual Zazzle image-fetch client must still be checked rather than assuming import success. This test seeds synthetic artwork administratively; it does not validate the actual consent/Turnstile upload path or CPU suitability. The real Zazzle visual/import and attribution check remain pending. Automatic approval review rejected printing the temporary checkout link because it exposes bearer image access; link disclosure has been separately requested from the owner and the link is retained only in ignored private `.qa/zazzle-test.json` pending that answer.

Rollback for this technical route: stop/remove only the new proxy service after reviewing fleet instructions, preserving its files and secret backup. No existing service depends on it; calculator/poster continue via the original storefront route. Do not enable checkout or publish the receipt UI without the remaining release checks and separate owner approval.

The already-expired disposable control object was removed after the expiry test. The one active synthetic artwork object remains available only until its original 24-hour read expiry and is subject to the bucket lifecycle; no real customer images were uploaded.
