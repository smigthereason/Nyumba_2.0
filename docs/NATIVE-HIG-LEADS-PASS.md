# Native UX, account and lead-contact pass

This patch focuses on the iOS/React Native experience and the agency viewing-request workflow.

## What changed

- Replaced the custom floating native navigation control with a conventional five-item tab bar: Discover, Search, Map, Saved, Account.
- Standardized primary controls to at least 44pt hit targets, added pressed/disabled states, and fixed `fullWidth` buttons so vertical actions do not collapse or render without visible labels.
- Rebuilt the native map interaction: Apple Maps provider by default on iOS, price markers, current-location action requested only when tapped, selected-property card, empty state, and smoother camera movement.
- Added an explicit Request Viewing form instead of silently submitting a lead. Name and phone are required; signed-in users are prefilled from their Supabase profile.
- Reworked the confirmation modal with a clearer hierarchy and one primary completion action.
- Made Account a visible top-level tab and completed consumer Supabase sign-up, including phone metadata/profile creation and email-confirmation handling.
- Linked authenticated viewing requests to the consumer's Supabase user when a valid access token is present.
- Added Call, Text and WhatsApp actions to agency leads.
- New public leads require usable contact details, preventing uncontactable "Buyer" records.
- Made Discover resilient to a single catalogue request failing by using independent settled results.
- Removed misleading payment-success language from the unverified purchase enquiry flow.

## Manual QA checklist

1. Fresh install: complete onboarding and verify all five tab labels remain visible.
2. Account > Create account: create a buyer with name, email, phone and password.
3. If Supabase email confirmation is enabled, verify the app shows the check-email state instead of pretending the user is signed in.
4. Sign in and confirm Account displays the buyer name, email and phone.
5. Map: verify county pins render, tapping a price pin selects a property, tapping the card opens details, and the location button requests permission only after tapping it.
6. Deny location permission and confirm the app remains usable and shows a clear system-style explanation.
7. Property > Request viewing: verify the modal is prefilled for signed-in users and requires name + phone for guests.
8. Submit a viewing and confirm the success modal shows visible View property and Done buttons.
9. Agency dashboard > Leads: open the new lead and verify the correct name/phone and Call, Text, WhatsApp actions.
10. Verify Mark contacted, Mark closed and Reopen continue to work.
11. Regression: call/WhatsApp sticky controls on agency, project and property detail pages remain side-by-side.
12. Purchase flow: verify it says purchase enquiry and does not claim that Nyumba verified a payment.
