import { NextRequest, NextResponse } from "next/server";
import { removeEmailSubByToken } from "@/lib/emailSubscriptions";

function htmlPage(title: string, heading: string, body: string, ok: boolean): NextResponse {
  const color = ok ? "#16a34a" : "#dc2626";
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="background:#ffffff;border-radius:8px;padding:40px 48px;max-width:440px;width:100%;border:1px solid #e5e7eb;text-align:center">
    <div style="font-size:48px;margin-bottom:16px">${ok ? "✅" : "❌"}</div>
    <h1 style="margin:0 0 12px;color:#111827;font-size:22px">${heading}</h1>
    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6">${body}</p>
    <a href="/" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600">
      Zur Karte
    </a>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (!token) {
    return htmlPage("Fehler", "Ungültiger Link", "Der Abmelde-Link ist ungültig.", false);
  }

  const removed = await removeEmailSubByToken(token);
  if (!removed) {
    return htmlPage("Bereits abgemeldet", "Du bist bereits abgemeldet.", "Deine E-Mail-Adresse ist nicht mehr in unserer Liste.", true);
  }

  return htmlPage(
    "Abgemeldet",
    "Erfolgreich abgemeldet",
    "Du erhältst keine Sperrmüll-Erinnerungen mehr per E-Mail.",
    true,
  );
}
