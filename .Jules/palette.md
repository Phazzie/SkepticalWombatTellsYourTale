## 2026-05-18 - Dynamic ARIA labels for repeating inline actions
**Learning:** In dashboard grids with multiple identical action buttons (e.g. "Approve", "Resolved"), generic `aria-label`s fail to provide context for screen reader users navigating out of context.
**Action:** Always append the context-specific item name or identifier to the `aria-label` (e.g. `aria-label={"Approve concept: ${concept.name}"}`) for repeating interactive elements within a grid or list.
