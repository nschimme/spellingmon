## 2025-09-13 - Accessible Color Swatches and Custom Toggle Options
**Learning:** Color swatch buttons (e.g. skin tone selectors) and option toggle buttons in custom wizard/creation forms in Vue often lack inner text or accessible names, causing screen readers to announce unlabelled buttons without selection state context.
**Action:** Ensure custom option buttons and swatches include `role="group"` on parent containers with `aria-labelledby`, explicit `:aria-label` text, and `:aria-pressed` attributes to reflect selection state.
