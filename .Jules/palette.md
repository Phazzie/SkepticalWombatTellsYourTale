
## 2024-05-17 - Dynamic ARIA labels & Focus states in repeating elements
**Learning:** In interactive dashboard widgets (like concept candidates or gap resolution lists), identical inline actions like "✓ Approve" or "✓ Resolved" lack sufficient context for screen readers when removed from their immediate visual container. Similarly, icon-only edit/delete buttons require explicit focus-visible states matching the theme color to remain accessible.
**Action:** When adding inline list actions, always inject the item's `name` or `description` directly into the button's `aria-label` (e.g., `aria-label={"Mark gap as resolved: ${gap.description}"}`). Also always append `focus-visible:outline-none focus-visible:ring-2` to icon-only interactive elements.
