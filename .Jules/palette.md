## 2024-05-11 - Dynamic ARIA labels for repeating inline actions
**Learning:** In grids or lists with repeating items (like "Approve", "Resolved", "Mark explored"), generic ARIA labels are insufficient for screen readers. Using dynamic values (e.g., `Approve concept: ${concept.name}`) provides essential context. Also, inline elements like `button` without standard button classes often lack focus states.
**Action:** Always map dynamic content properties to the `aria-label` for repeating inline buttons and explicitly add `focus-visible` utility classes to ensure keyboard accessibility.
