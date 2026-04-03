# Proposal: Consent Banner for Vercel Analytics

## What
Add a GDPR-compliant consent banner that gates Vercel Analytics behind explicit user consent.

## Why
The Datenschutzerklärung (privacy policy) currently states:
> "Vercel Analytics wird nur nach Ihrer Einwilligung aktiviert."

But `<Analytics />` is rendered unconditionally in `app/layout.tsx`, meaning Analytics fires for every visitor regardless of consent. This contradicts the published privacy policy and violates § 25 TDDDG (requires prior consent for non-essential device access) and Art. 6 Abs. 1 lit. a DSGVO.

## Scope
- New client component: `components/ConsentBanner.tsx` — shows a bottom banner on first visit
- New client component: `components/AnalyticsConsent.tsx` — wraps `<Analytics />`, only renders when consent is `"granted"`
- Modify `app/layout.tsx` — replace `<Analytics />` with `<AnalyticsConsent />`

## Out of scope
- Cookie banner for other purposes (no cookies are set by this site)
- Consent Management Platform (CMP)
- Analytics for pages that are already excluded from crawling (impressum, datenschutz)
