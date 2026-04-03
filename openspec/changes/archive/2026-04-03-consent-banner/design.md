# Design: Consent Banner

## Architecture

```
app/layout.tsx
├── <ConsentBanner />   (components/ConsentBanner.tsx)
└── <AnalyticsConsent /> (components/AnalyticsConsent.tsx)
      └── <Analytics />  (rendered only when consent = "granted")
```

## State storage
- Key: `va-consent` in `localStorage`
- Values: `"granted"` | `"denied"` | absent (no decision yet)

## Component: `AnalyticsConsent`
- `"use client"`
- `useState<string | null>(null)` — null prevents hydration mismatch
- `useEffect` on mount: read `localStorage.getItem('va-consent')`, update state
- Also listens for `window` event `"va-consent-update"` to react to banner interaction without page reload
- Renders `<Analytics />` from `@vercel/analytics/next` only when state === `"granted"`

## Component: `ConsentBanner`
- `"use client"`
- `useState<boolean>(false)` for `visible`
- `useEffect` on mount: if `localStorage.getItem('va-consent') === null` → setVisible(true)
- "Akzeptieren": stores `"granted"`, dispatches `new Event("va-consent-update")`, hides
- "Ablehnen": stores `"denied"`, dispatches `new Event("va-consent-update")`, hides
- Fixed bottom bar, z-50, white background, border-t
- Links to /datenschutz
- German text, matches site's existing Tailwind class style

## Layout change
- Remove direct `import { Analytics }` and `<Analytics />`
- Add `<ConsentBanner />` and `<AnalyticsConsent />` inside `<body>`
