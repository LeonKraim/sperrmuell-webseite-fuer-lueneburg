# Proposal: Email Subscribe Consent Checkbox

## What

Add a mandatory, non-pre-ticked consent checkbox to the `EmailSubscribeForm` modal. The checkbox must be explicitly checked by the user before the subscribe button is enabled. A link to the Datenschutzerklärung (`/datenschutz`) is placed directly adjacent to the consent checkbox label.

## Why

- GDPR (DSGVO) requires that consent for email marketing is freely given, specific, informed, and unambiguous. A pre-ticked checkbox does not satisfy this requirement.
- The user explicitly requested a non-pre-ticked checkbox and a privacy-policy link next to the consent element.
- Without this, the form can be submitted without the user knowingly consenting to receive emails, which is a legal compliance gap.

## Scope

- One file modified: `components/EmailSubscribeForm.tsx`
- No backend changes required — consent is a front-end gate; the existing confirmation email flow already handles double opt-in.

## Out of Scope

- Storing consent timestamp server-side
- Changes to the API route or data schema
