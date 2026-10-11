## 2025-09-13 - Accessible Color Swatches and Custom Toggle Options
**Learning:** Color swatch buttons (e.g. skin tone selectors) and option toggle buttons in custom wizard/creation forms in Vue often lack inner text or accessible names, causing screen readers to announce unlabelled buttons without selection state context.
**Action:** Ensure custom option buttons and swatches include `role="group"` on parent containers with `aria-labelledby`, explicit `:aria-label` text, and `:aria-pressed` attributes to reflect selection state.

## 2025-09-20 - Contextual ARIA Labels for Multi-Step Dialogs and Boundary Navigation Buttons
**Learning:** Interactive control icons (like ⬅️/➡️ navigation arrows or ▼/✕ modal actions) often have static ARIA labels or lack native `:disabled` attributes at valid boundaries, leading screen readers to announce incorrect actions or allow invalid triggers.
**Action:** Always compute dynamic `:aria-label` strings based on step state (e.g., intermediate vs final line) and bind native `:disabled` attributes alongside disabled visual utility classes for boundary controls.

## 2025-09-22 - Accessible Custom Radio Selection Cards
**Learning:** Custom selection cards (such as starter choice screens) implemented as clickable `div`s lack native radio semantics and focus indicators, preventing screen reader and keyboard users from selecting options.
**Action:** Wrap card containers in `role="radiogroup"` with `aria-label`, assign `role="radio"`, `:aria-checked`, `tabindex="0"`, dynamic `:aria-label`, keydown handlers (`@keydown.enter.space.prevent`), and `focus-visible` ring classes to selection cards.

## 2025-09-24 - Accessible Dialogue Boxes and Live Text Regions
**Learning:** Dialogue boxes that update text content dynamically across steps need `aria-live="polite"` on the text element and `role="dialog"` with dynamic `:aria-label` on the container card. Without `aria-hidden="true"` on text-advance indicator glyphs (`▼`/`✕`), screen readers read decorative characters instead of seamlessly announcing new lines.
**Action:** Add `role="dialog"`, `:aria-label`, and `aria-live="polite"` to dialogue containers and text blocks, while ensuring decorative advance arrow glyphs are marked with `aria-hidden="true"`.

## 2025-09-28 - Progress Bar Semantics and Helper ARIA Labels for Battle Actions
**Learning:** Progress meter bars (like HP and EXP bars) in game UI components require `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`, and `aria-valuetext` to announce numeric progress to assistive technologies. Dynamic action buttons (like battle move buttons) require dedicated `useI18n()` helper functions to format name, type, and effectiveness context into `:aria-label` while marking decorative icon glyphs with `aria-hidden="true"`.
**Action:** Add progressbar ARIA attributes to visual status bars and compute comprehensive `:aria-label` strings via component `useI18n()` helpers for dynamic action controls.
