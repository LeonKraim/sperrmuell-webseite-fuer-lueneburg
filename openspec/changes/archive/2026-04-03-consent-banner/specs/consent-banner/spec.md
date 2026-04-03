# Consent Banner

## ADDED Requirements

### Requirement: Consent banner shown on first visit

A fixed bottom banner MUST be shown to any visitor who has not yet made a consent decision, containing accept and decline actions and a link to the privacy policy.

#### Scenario: First-time visitor sees consent banner
- Given the user has no `va-consent` key in localStorage
- When any page of the site loads
- Then a fixed bottom banner is visible
- And the banner contains an "Akzeptieren" button and an "Ablehnen" button
- And the banner links to /datenschutz

#### Scenario: Returning visitor who accepted does not see banner
- Given the user has `va-consent = "granted"` in localStorage
- When any page of the site loads
- Then no consent banner is rendered

#### Scenario: Returning visitor who declined does not see banner
- Given the user has `va-consent = "denied"` in localStorage
- When any page of the site loads
- Then no consent banner is rendered

### Requirement: Analytics only fires after explicit consent

Vercel Analytics MUST only be injected into the page when the user has explicitly granted consent. Without a stored `"granted"` decision, the Analytics script MUST NOT load.

#### Scenario: Analytics is active when consent is granted
- Given the user clicks "Akzeptieren" on the consent banner
- When the page is running
- Then `va-consent = "granted"` is stored in localStorage
- And Vercel Analytics script is injected into the page

#### Scenario: Analytics is not active when consent is denied
- Given the user clicks "Ablehnen" on the consent banner
- When the page is running
- Then `va-consent = "denied"` is stored in localStorage
- And Vercel Analytics script is NOT injected into the page

#### Scenario: Analytics is not active with no stored consent
- Given the user has no `va-consent` key in localStorage
- When any page loads
- Then Vercel Analytics script is NOT injected into the page
