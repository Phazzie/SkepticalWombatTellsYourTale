## 2024-05-14 - Repeating Inline Action Buttons Require Context-Aware aria-labels
**Learning:** Repeating inline action buttons (e.g., "✓ Approve", "✓ Resolved") in lists or grids cause accessibility issues if they lack distinct contexts. Screen readers announce the same label for different items.
**Action:** Always provide context-aware `aria-label`s mapping the action to the specific item being acted upon (e.g., `aria-label="Approve concept: Concept Name"`) when creating repeating list buttons.
