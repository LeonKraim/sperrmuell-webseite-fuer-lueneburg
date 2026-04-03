export function buildConfirmationEmail(
  token: string,
  baseUrl: string,
): { subject: string; html: string } {
  const confirmUrl = `${baseUrl}/api/email-confirm?token=${token}`;
  const unsubscribeUrl = `${baseUrl}/api/email-unsubscribe?token=${token}`;

  return {
    subject: "Bitte bestätige deine E-Mail-Adresse – Sperrmüll Abfuhrplan",
    html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#E63946;padding:24px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">Sperrmüll Abfuhrplan</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;color:#111827;font-size:18px">E-Mail-Adresse bestätigen</h2>
          <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6">
            Klicke auf den Button um deine E-Mail-Adresse zu bestätigen und zukünftig einen Tag vor der Sperrmüll-Abfuhr benachrichtigt zu werden.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:#E63946;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            E-Mail-Adresse bestätigen
          </a>
          <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.5">
            Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.<br>
            Der Link ist 24 Stunden gültig.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;background:#f9fafb">
          <p style="margin:0;color:#9ca3af;font-size:11px">
            <a href="${unsubscribeUrl}" style="color:#9ca3af">Abmelden</a>
            &nbsp;·&nbsp;
            <a href="${baseUrl}/impressum" style="color:#9ca3af">Impressum</a>
            &nbsp;·&nbsp;
            <a href="${baseUrl}/datenschutz" style="color:#9ca3af">Datenschutz</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export function buildNotificationEmail(
  collectionDate: string,
  unsubscribeToken: string,
  baseUrl: string,
): { subject: string; html: string } {
  const unsubscribeUrl = `${baseUrl}/api/email-unsubscribe?token=${unsubscribeToken}`;
  const siteUrl = baseUrl;

  return {
    subject: `Sperrmüll morgen am ${collectionDate}`,
    html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#E63946;padding:24px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">Sperrmüll Abfuhrplan</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;color:#111827;font-size:18px">🗑️ Morgen ist Sperrmüll!</h2>
          <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6">
            Am <strong>${collectionDate}</strong> findet die Sperrmüll-Abfuhr statt.
          </p>
          <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6">
            Stelle deinen Sperrmüll rechtzeitig bereit!
          </p>
          <a href="${siteUrl}" style="display:inline-block;background:#E63946;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Karte öffnen
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;background:#f9fafb">
          <p style="margin:0;color:#9ca3af;font-size:11px">
            Du erhälst diese E-Mail weil du dich für Sperrmüll-Erinnerungen angemeldet hast. &nbsp;·&nbsp;
            <a href="${unsubscribeUrl}" style="color:#9ca3af">Abmelden</a>
            &nbsp;·&nbsp;
            <a href="${siteUrl}/impressum" style="color:#9ca3af">Impressum</a>
            &nbsp;·&nbsp;
            <a href="${siteUrl}/datenschutz" style="color:#9ca3af">Datenschutz</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
