# Version 2 thermal receipt exports

Standalone 4-inch-wide by 16-inch-tall personal PDF exports. This exporter does not publish the website, change the Zazzle template, upload personal data or enable checkout.

`make_v2.py private-models.json output-directory` accepts a JSON list of `{input, model, title}` entries. Produce each model with the repository's `buildReceipt(input)`. Inputs include name, age, plan, income, currency, visits, parentAge, date and dateKind (printed or birthday). Keep personal JSON and PDFs outside git.

V2 uses an original vector 5×7 pixel alphabet, minimum visible glyph height 9.5 pt, a prominent recipient heading, full-height text layout, inverted section bands, and a calculator/cross/skull/sun motif per edition. Searchable invisible companion text accompanies the vector glyphs. The PDF has no embedded bitmap. Dates are supplied explicitly; changing a date does not derive a different age.

Requires Python reportlab and pypdf. Review rendered pages before delivery. Retain older versions and export into a distinct V2 directory. The web renderer remains independently versioned and unchanged by this script.

## Version 3

`make_v3.py` uses the same private model inputs and imports V2's original pixel alphabet. It keeps short values and numerical totals on the first baseline of their labels, aligns values to a shared right edge, and wraps labels within the remaining width without shrinking lettering. Longer narrative answers can occupy a separate line. Clock, mug, pill, bolt, skull, candle, coin, star and heart motifs mark the appropriate sections. Each export also produces a private alignment JSON for verification; do not commit personalized outputs. V2 exports are retained.

## Version 4 — LIFE RECEIPT gift exports

`make_v4.py` retains V3's alignment and uses LIFE RECEIPT as the headline, with NO REFUNDS as the bottom stamp. The entire income/earnings/tax section is omitted from the exported artwork. It is replaced by STILL TO COME / PLAYFUL EST., containing edition-specific jokes about breaths, good nights' sleep, turns in bed and daydreams, plus a moon icon.

These are deliberately invented editorial estimates, not physiological or sleep predictions: remaining days = round((plan - age) × 365.25); 20,000 breaths/day, good sleep on 70% of nights, six bed turns/night, three daydreams/day. These assumptions exist solely to generate the playful counts. Values share the original numerical label baseline and right edge. No extra medical or personal input is requested. A supplied income can remain in the private source model for older exports but must not appear in V4 text or metadata; the exporter verifies that absence.

V4 keeps the printing/birthday date and recipient inputs, 4×16-inch vector page geometry, and prior files. The website, worker, Zazzle template and checkout remain unchanged.

## Version 5 — themed gift copy and clear totals

`make_v5.py` keeps the V4 gift layout and adds a 20-cell life-used bar alongside the percentage. TOTAL / ONE LIFE, PAYMENT METHOD / TIME and CHANGE DUE / NONE replace the ambiguous multi-line subtotal. Numerical values stay on their labels' first baseline.

Body Warranty replaces the earlier deterioration/colonoscopy section with non-gross fictional bodily-function counts: heartbeats, breaths, blinks, yawns, stretches, grins, goosebumps, sighs, sleep and pillow flips. Memento Mori becomes mildly uncanny rather than bereavement-focused: moving shadows, portraits making eye contact, unexplained noises, extra dream guests and floorboards in empty rooms. Standard and Sunshine retain their respective everyday/sunny themes.

All new counts are deliberately invented editorial assumptions, not health forecasts: days as in V4; heartbeats 100,000/day, breaths 20,000/day, blinks 15,000/day, yawns 7/day, sighs 1/day, stretches and pillow flips 2/day, goosebumps 0.5/day, grins/daydreams 3/day, good nights 70% of days, bed turns 6/day. Creepy fiction counts use moving shadows 13/year, shoulder checks 24/year, portraits 9/year, ceiling inspections 13% of nights, extra dream guests 9% of nights, unexplained floorboards 17% of days. Visible section labels mark playful/fictional estimates. Optional partner/children/friends/pets features remain in the backlog and are not inferred from source data.

## Version 6 — illustrated, consistent rows

`make_v6.py` adds original vector pixel motifs from `pixel_icons.py` beside every label/value pair, plus two extra edition motifs at the top. Icons occupy their own 17pt gutter; labels reflow within the remaining width without shrinking. Each numerical value retains a common first baseline and right edge. Short narrative answers now follow the same paired-row layout rather than a staircase; wording is shortened where needed. The exporter rejects narrative pairs that would require the old fallback layout.

TOTAL / ALL YOU'LL EVER HAVE restores the owner's preferred closing phrase, readable on a single line with the receipt icon. The three Mori answers are LIGHTS ON / JUST IN CASE, UPSTAIRS / PROBABLY NOTHING, MIRROR / YOU. PROBABLY. Sunshine's two narrative answers are shortened to fit the same grid. V5's life-used bar and other approved content remain. Review all four rendered pages before delivery; keep earlier exports.

## Version 7 — large framing icons

`make_v7.py` keeps V6 text and row layout. The two upper side motifs grow from 16pt to 45pt and move into the open left/right space beside ISSUED TO. A matching 36pt pair flanks the bottom thank-you lines. The motifs vary by edition. All are vector pixel shapes; the recipient name, copy, value alignment and page dimensions are retained. Render and visually inspect all four outputs for text/icon clearance.
