# Browser Agent Test Script: Preview Bridge Audit

Purpose: verify that preview scroll/navigation events map to the correct CMS editor section for `gallery`, `contact`, and `booking`.

Use this script with an agent that has a browser extension and can interact with pages, scroll, and read visible UI text.

## Preconditions

1. Start the CMS locally with:

```bash
npm run dev
```

2. Open the local CMS URL shown by Vite.
3. Make sure the app is running in development mode.
4. Use the split preview/editor screen, not legacy routes.

## What To Inspect

On each test page, watch the dev panels in the CMS UI:

- `Preview Bridge` panel in the right editor column
- `Bridge Audit` section inside the amber `DevInspector`

For every interaction, record:

- active CMS route
- incoming bridge event type
- incoming `cmsSectionId` if shown
- incoming preview URL if shown
- mapped CMS target in the panel: `map=page/section[/subsection]`
- whether the visible editor content matches the visible preview section

## Test Pages

Test these routes in order:

1. `/edit/gallery/sections/gallery`
2. `/edit/contact/sections/contact`
3. `/edit/booking/sections/booking`

## Test Procedure

Repeat the full procedure for each page.

### A. Initial Load

1. Navigate directly to the route.
2. Wait until the preview iframe has loaded.
3. Confirm that the `Bridge` indicator in the preview toolbar shows ready.
4. In the dev panels, note the latest `bridge-ready` or `navigate` event.
5. Record whether the route shown in the CMS matches the page being previewed.

Expected result:

- preview loads the correct public page
- CMS stays on the intended page/section
- no unexpected redirect to `home/hero`

### B. Scroll Mapping

1. Scroll slowly through the preview pane from top to bottom.
2. Pause whenever the page visibly enters a new content block.
3. After each pause, inspect the latest `scroll` event in the dev panels.
4. Record:
   - visible preview block
   - `cmsSectionId`
   - mapped `page/section`
   - whether the editor changed
5. Continue until the bottom of the page.

Expected result:

- `gallery` should remain mapped to `gallery/gallery`
- `contact` page should map visible contact content to `contact/contact`
- FAQ area on the contact page should map to `contact/faq`
- `booking` page should only map to valid booking sections: `booking/booking`, `booking/book`, or `booking/form`
- no jump to unrelated pages or sections

### C. Navigation Mapping

1. Click at least one internal link or CTA in the preview if present.
2. If the page navigates, inspect the latest `navigate` event.
3. Record:
   - source page
   - destination preview URL
   - mapped CMS route
   - whether the editor followed correctly

Expected result:

- destination URL should map to the correct CMS route
- no fallback to `home/hero` unless the URL truly has no mapping

### D. Language Change

1. If the public site exposes a language switcher in preview, switch language once.
2. Inspect whether a `language-change` or `navigate` event is logged.
3. Record:
   - new preview URL
   - logged language
   - whether the CMS preview stayed on the same logical page/section

Expected result:

- language can change without breaking page/section mapping

## Failure Rules

Mark a test as failed if any of the following happens:

- preview visibly shows one section while editor shows another
- `scroll` event maps to the wrong `page/section`
- `cmsSectionId` is missing when a section transition clearly happened
- route falls back to `home/hero` unexpectedly
- FAQ area does not move editor from `contact/contact` to `contact/faq`
- booking page scroll events map outside `booking/booking`, `booking/book`, `booking/form`

## Output Format

Return results in this exact structure:

```md
# Preview Bridge Audit Results

## gallery
- Initial load: PASS/FAIL
- Scroll mapping: PASS/FAIL
- Navigation mapping: PASS/FAIL or NOT TESTED
- Language change: PASS/FAIL or NOT TESTED
- Notes:
- Events observed:

## contact
- Initial load: PASS/FAIL
- Scroll mapping: PASS/FAIL
- Navigation mapping: PASS/FAIL or NOT TESTED
- Language change: PASS/FAIL or NOT TESTED
- Notes:
- Events observed:

## booking
- Initial load: PASS/FAIL
- Scroll mapping: PASS/FAIL
- Navigation mapping: PASS/FAIL or NOT TESTED
- Language change: PASS/FAIL or NOT TESTED
- Notes:
- Events observed:

## Reproducible Issues
- Issue:
- Route:
- Preview state:
- Logged event:
- Expected mapping:
- Actual mapping:
```

## Notes For The Agent

- Do not assume mappings are correct because the route loads.
- Use the dev panels as the source of truth for what the bridge actually sent.
- If the editor changes while the visible preview section does not, record that as a mismatch.
- If no event appears after an obvious scroll transition, record that explicitly.
