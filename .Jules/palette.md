## 2025-09-13 - Accessible Color Swatches and Custom Toggle Options
**Learning:** Color swatch buttons (e.g. skin tone selectors) and option toggle buttons in custom wizard/creation forms in Vue often lack inner text or accessible names, causing screen readers to announce unlabelled buttons without selection state context.
**Action:** Ensure custom option buttons and swatches include `role="group"` on parent containers with `aria-labelledby`, explicit `:aria-label` text, and `:aria-pressed` attributes to reflect selection state.

## 2025-09-20 - Contextual ARIA Labels for Multi-Step Dialogs and Boundary Navigation Buttons
**Learning:** Interactive control icons (like ⬅️/➡️ navigation arrows or ▼/✕ modal actions) often have static ARIA labels or lack native `:disabled` attributes at valid boundaries, leading screen readers to announce incorrect actions or allow invalid triggers.
**Action:** Always compute dynamic `:aria-label` strings based on step state (e.g., intermediate vs final line) and bind native `:disabled` attributes alongside disabled visual utility classes for boundary controls.
