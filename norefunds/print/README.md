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
