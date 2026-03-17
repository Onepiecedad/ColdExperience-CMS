# Browser Agent Debug Script: Website Bridge Scroll Events

Purpose: determine why `gallery`, `contact`, and `booking` do not emit preview `scroll` bridge events while `home` does.

This script is for an agent with browser extension access to the public site and the local CMS running in dev mode.

## Preconditions

1. Start the CMS locally:

```bash
npm run dev
```

2. Open the local CMS in a browser.
3. Keep the split preview/editor visible.
4. Open browser devtools if the agent can inspect DOM and console.

## Reference Behavior

Use `home` as the known-good reference.

Reference route:

- `/edit/home/sections/hero`

Problem routes:

- `/edit/gallery/sections/gallery`
- `/edit/contact/sections/contact`
- `/edit/booking/sections/booking`

## Goal

For each problem page, determine which of these is true:

1. bridge script is not loaded
2. section elements exist but are missing `data-cms-section`
3. section elements exist but observer does not trigger
4. observer triggers but does not send `postMessage`
5. `postMessage` sends data in a shape the CMS does not use

## Procedure

Perform the full sequence for `home` first, then repeat for each problem page.

## A. Confirm Reference On Home

1. Open `/edit/home/sections/hero`
2. Scroll in preview
3. Confirm that `Preview Bridge` and `Bridge Audit` show `scroll` events with `cms=...`
4. In the preview DOM, inspect visible content containers
5. Record:
   - selector used by scroll-tracked sections
   - presence of `data-cms-section`
   - any other section marker attributes

Expected result:

- visible section containers on home clearly expose bridge-friendly attributes
- scrolling creates `scroll` events in the CMS dev panels

## B. Inspect Script Presence

For each problem page:

1. Open the route in the CMS
2. Wait for preview to load
3. In preview, confirm whether `Bridge` status becomes ready
4. If browser tools allow console inspection, check for bridge-related errors
5. Record:
   - `Bridge` ready or not
   - any console errors
   - whether any `navigate` events still appear

Interpretation:

- `navigate` works but `scroll` does not usually means the bridge exists but scroll observation is failing
- no bridge readiness at all suggests the script did not initialize

## C. Inspect DOM Markers

For each problem page:

1. Inspect the main content area in preview
2. Search visible section wrappers for:
   - `data-cms-section`
   - `id`
   - `data-*` attributes that look like section identifiers
3. Compare against the structure seen on `home`
4. Record for the top, middle, and bottom content blocks:
   - element tag
   - class name
   - `id`
   - `data-cms-section` value if present

Expected result:

- if no meaningful section markers exist, missing `scroll` events are expected

## D. Scroll Event Emission Check

For each problem page:

1. Scroll slowly through the preview
2. Watch the CMS dev panels
3. If browser tools allow event inspection, monitor whether `postMessage` is being triggered from the iframe page
4. Record:
   - whether any `scroll` event appears in CMS
   - if yes, its payload
   - if not, whether the visible DOM had valid section markers

Interpretation:

- markers present + no events = observer or event-dispatch bug
- no markers + no events = markup contract missing

## E. Compare Working vs Broken Pages

Build a side-by-side comparison for:

- `home`
- `gallery`
- `contact`
- `booking`

Compare:

- bridge ready status
- presence of `data-cms-section`
- number of scroll-tracked content blocks
- whether `scroll` events appear
- event payload shape

## F. Identify Most Likely Root Cause

Choose one primary root cause per failing page:

- missing section markers
- wrong selector in bridge script
- script not mounted on that template
- observer threshold/config issue
- event dispatch bug
- CMS ignoring payload shape

## Failure Signals To Look For

- preview shows clear multiple sections but DOM has no `data-cms-section`
- bridge is ready and `navigate` works, but `scroll` never appears
- home uses different wrapper structure than broken pages
- broken pages use a template component that never opts into bridge tracking

## Output Format

Return results in this exact structure:

```md
# Website Bridge Debug Results

## Home Reference
- Bridge ready:
- Scroll events observed:
- Section marker pattern:
- Notes:

## Gallery
- Bridge ready:
- Navigate events observed:
- Scroll events observed:
- Section markers found:
- Likely root cause:
- Notes:

## Contact
- Bridge ready:
- Navigate events observed:
- Scroll events observed:
- Section markers found:
- Likely root cause:
- Notes:

## Booking
- Bridge ready:
- Navigate events observed:
- Scroll events observed:
- Section markers found:
- Likely root cause:
- Notes:

## Recommended Fix
- Primary issue:
- File/component likely responsible:
- Why:
```

## Notes For The Agent

- Do not stop at “no scroll events”; inspect the DOM and compare with `home`.
- Use `home` as the baseline contract for how bridge-aware sections should look.
- If devtools access is limited, rely on visible DOM inspection and the CMS bridge panels.
- Prefer concrete evidence over guesses: exact attributes, exact event presence, exact route behavior.
