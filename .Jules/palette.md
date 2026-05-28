## 2026-05-28 - Dynamic ARIA labels for repeatable UI components
**Learning:** React components that render lists of repeated interactive elements (like "Resolve" or "Approve" buttons in maps) lack context for screen readers if they all share identical labels.
**Action:** Always map contextual data from the mapped item (e.g., `tangent.thread`, `concept.name`) into dynamic `aria-label`s so screen readers can distinguish between similar actions.
