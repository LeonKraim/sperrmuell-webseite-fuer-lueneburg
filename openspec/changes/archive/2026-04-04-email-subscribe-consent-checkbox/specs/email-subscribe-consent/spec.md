# Email Subscribe Consent Checkbox

## ADDED Requirements

### Requirement: Consent Checkbox

The email subscribe form MUST include a checkbox that is unchecked by default. The user MUST explicitly check it before the subscribe button becomes enabled.

#### Scenario: Checkbox starts unchecked

- **Given** the email subscribe modal is open
- **When** the form is first rendered
- **Then** the consent checkbox is unchecked
- **And** the submit button is disabled

#### Scenario: Checkbox enables submit button

- **Given** the email subscribe modal is open
- **When** the user checks the consent checkbox
- **Then** the submit button becomes enabled

#### Scenario: Checkbox resets on close

- **Given** the consent checkbox was checked
- **When** the user closes the modal
- **Then** the checkbox is unchecked the next time the modal is opened

---

### Requirement: Privacy Policy Link

A link to the Datenschutzerklärung (/datenschutz) MUST appear as part of the consent checkbox label, directly adjacent to the consent text.

#### Scenario: Privacy policy link is present

- **Given** the email subscribe modal is open
- **When** the form is rendered
- **Then** a link labeled "Datenschutzerklärung" is visible next to the consent checkbox
- **And** the link points to /datenschutz
- **And** the link opens in a new browser tab
