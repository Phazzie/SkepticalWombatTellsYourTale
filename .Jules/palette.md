## 2026-05-06 - Form Loading States
**Learning:** Loading states combined with disabling the form elements natively prevents race conditions while providing a good user experience. Also, ensuring that forms can be submitted via the Enter key (using onKeyDown on the input) drastically improves keyboard usability.
**Action:** When implementing new forms or refactoring existing ones, always check for keyboard accessibility and ensure loading states explicitly disable the submit action.
