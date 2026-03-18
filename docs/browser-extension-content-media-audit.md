# Browser Agent Test Script: Content And Media Audit

Purpose: verify that the CMS editor shows the correct text fields and media for the section currently visible in preview.

Use this with an agent that has browser extension access and can inspect the CMS UI and preview side by side.

## Preconditions

1. Start the CMS locally:

```bash
npm run dev
```

2. Open the CMS in development mode.
3. Use the split preview/editor view.
4. Keep the dev panels visible while testing.
5. Assume bridge routing is already working unless a new mismatch is observed.

## Audit Scope

Run the audit in this order:

1. `gallery`
2. `contact`
3. `booking`
4. `packages`
5. detail pages
6. system/legal pages if requested later

## What Counts As Correct

A section passes only if all of these are true:

- preview is visibly on the intended section
- CMS route matches the expected `page/section[/subsection]`
- editor fields belong to that section only
- media shown in the editor belongs to that section only
- changing the visible preview section updates the editor to the matching section

## What Counts As A Failure

Mark the section as failed if any of these happens:

- editor shows fields from a different section
- expected section text is missing from the editor
- unrelated fields are mixed in
- editor media does not match what is visible in preview
- preview media exists but no corresponding media/editable field appears
- section route is right but content subset is wrong
- `packages` page shows incomplete package data relative to preview cards

## Procedure Per Section

Repeat this for each section you can visibly identify.

### A. Identify The Visible Section

1. Open the page route in the CMS.
2. Scroll the preview until a clear section is visible.
3. Record the visible section by human description, not just route.

Examples:

- `gallery hero`
- `gallery image grid`
- `contact hero`
- `contact faq`
- `booking hero`
- `booking form`
- `packages package cards`

### B. Check CMS Route

1. Record the current route.
2. Record the breadcrumb shown in the editor.
3. Confirm the route and breadcrumb fit the visible preview section.

### C. Check Text Fields

1. Read the editor field labels.
2. Compare them to text visibly rendered in preview.
3. Decide whether the editor exposes the right text group for the current section.

Record:

- expected text themes
- visible editor field labels
- missing text
- unrelated text

### D. Check Media

1. Switch to the `Media` tab in the editor if relevant.
2. Compare preview media with editor media fields and uploaded media cards.
3. Record whether the visible preview assets appear to belong to the same section.

Record:

- visible preview media
- visible editor media
- missing media
- unrelated media

### E. Section Transition Check

1. Scroll to the next clearly different section in preview.
2. Confirm the editor follows.
3. Repeat text/media check at the new section.

## Page-Specific Focus

## Gallery

Verify at minimum:

- hero text
- category/filter text
- gallery/image-grid related text
- CTA text
- gallery media relevance

## Contact

Verify at minimum:

- hero text
- contact form text
- contact info text
- FAQ text
- contact-related media only

## Booking

Verify at minimum:

- booking hero text
- booking form labels and validation text
- booking summary/CTA text if present
- booking media relevance

## Packages

Verify at minimum:

- package page hero/intro text
- package cards shown in preview
- package editor card data matches preview card content
- package card media matches preview card media

Special rule:

- if package cards appear in preview but are only partially editable in the CMS, mark that as a failure

## Detail Pages

For each tested detail page, verify:

- route maps to correct subsection
- text fields belong only to that subsection prefix
- media belongs only to that subsection
- no sibling adventure content leaks in

## Severity Rules

Classify each issue as:

- `critical`: editor points to wrong section or wrong media entirely
- `high`: major section text/media missing
- `medium`: extra unrelated fields appear or partial mismatch
- `low`: label/order/presentation issue but content is basically correct

## Output Format

Return results in this exact structure:

```md
# Content Media Audit Results

## Gallery
- Section:
- Route:
- Preview description:
- Editor breadcrumb:
- Text fields correct: PASS/FAIL
- Media correct: PASS/FAIL
- Issues:
- Severity:

## Contact
- Section:
- Route:
- Preview description:
- Editor breadcrumb:
- Text fields correct: PASS/FAIL
- Media correct: PASS/FAIL
- Issues:
- Severity:

## Booking
- Section:
- Route:
- Preview description:
- Editor breadcrumb:
- Text fields correct: PASS/FAIL
- Media correct: PASS/FAIL
- Issues:
- Severity:

## Packages
- Section:
- Route:
- Preview description:
- Editor breadcrumb:
- Text fields correct: PASS/FAIL
- Media correct: PASS/FAIL
- Issues:
- Severity:

## Detail Pages
- Subsection:
- Route:
- Preview description:
- Editor breadcrumb:
- Text fields correct: PASS/FAIL
- Media correct: PASS/FAIL
- Issues:
- Severity:

## Consolidated Issues
- Severity:
- Page:
- Section:
- Problem:
- Likely fix location:
```

## Notes For The Agent

- Use preview as the source of truth.
- Do not assume a section is correct just because the route is correct.
- Prefer concrete mismatches over vague wording.
- If unsure whether media belongs to a section, describe what you see and mark it as uncertain rather than passing it.
