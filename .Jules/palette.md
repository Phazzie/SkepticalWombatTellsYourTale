
## 2024-05-15 - Repeating Inline Action Buttons Accessibility
**Learning:** Repeating inline action buttons masquerading as text links (e.g., "✓ Approve") are invisible to screen readers without context, and applying default focus rings on them often causes ugly layout shifts or clips against container boundaries.
**Action:** Always add dynamic, context-aware `aria-label`s (e.g., `aria-label={"Approve: ${concept.name}"}`) to these buttons, and apply explicit focus utility classes (`focus-visible:outline-none focus-visible:ring-2 rounded px-1 -ml-1`) to pad the focus ring without shifting adjacent elements.
