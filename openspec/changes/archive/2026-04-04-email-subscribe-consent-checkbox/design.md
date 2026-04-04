# Design: Email Subscribe Consent Checkbox

## Component: `EmailSubscribeForm.tsx`

### State Addition

Add a `consentChecked: boolean` state variable initialized to `false`.

```ts
const [consentChecked, setConsentChecked] = useState(false);
```

### Form Gate

The submit button `disabled` prop is extended:

```tsx
disabled={formState === "loading" || !consentChecked}
```

### Checkbox + Privacy Link UI

Placed between the email input (and optional error message) and the submit button:

```tsx
<div className="mb-3 flex items-start gap-2">
  <input
    id="consent"
    type="checkbox"
    checked={consentChecked}
    onChange={(e) => setConsentChecked(e.target.checked)}
    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
    required
  />
  <label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed">
    Ich stimme zu, dass meine E-Mail-Adresse zur Zusendung von Sperrmüll-Erinnerungen gespeichert wird.{" "}
    <a
      href="/datenschutz"
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-blue-600 hover:text-blue-800"
    >
      Datenschutzerklärung
    </a>
  </label>
</div>
```

### Reset on Close

When the dialog is closed (or on successful send), reset `consentChecked` to `false` alongside any other state resets, so reopening the form starts fresh.

## Accessibility

- `<input id="consent">` paired with `<label htmlFor="consent">` for screen-reader association.
- `required` attribute on checkbox for native browser validation fallback.
- Keyboard focusable and operable.

## Layout

The privacy policy link is textually inline within the label — "directly adjacent" as requested — and opens in a new tab so the user does not lose the modal context.
