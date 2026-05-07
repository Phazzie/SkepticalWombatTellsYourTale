## 2026-05-07 - Component specific focus states and ARIA semantics
**Learning:** For Next.js projects relying strictly on Tailwind CSS, standard accessible HTML structures (like accordion buttons and icon-only buttons) sometimes lack base styles for keyboard focus visibility and accessible names.
**Action:** When adding ARIA properties like `aria-controls` and `aria-expanded` for dynamic UI blocks, always complement them with `focus-visible:ring-*` classes to ensure full keyboard navigation support, and always use `aria-label` for buttons rendering only emojis or SVG marks.
