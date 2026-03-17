/**
 * Tests that both the /api/notify and /api/email-subscribe routes always use
 * the production URL in outgoing emails, never the preview/request host URL.
 */
import { NextRequest } from "next/server";

// Set VAPID env vars before any module imports so webpush.setVapidDetails doesn't throw
process.env.VAPID_EMAIL = "mailto:test@example.com";
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY =
  "BO-_PMymTz9MzfL4kW3q1oNbkYD4m9Fk3NxtW3PvOhlz7mDEF0X1c7yC5pRo5CkNN1C8_69R9swVrAVDbv_icsY";
process.env.VAPID_PRIVATE_KEY = "Z5_AP0NbKBmP9dDjqlgDNfaTYda1PrX26A7njKKx5FA";

const mockSendEmail = jest.fn().mockResolvedValue(undefined);
const mockAddEmailSub = jest.fn().mockResolvedValue("confirm-token-abc");
const mockGetConfirmedEmailSubs = jest.fn().mockResolvedValue([]);
const mockPruneExpiredUnconfirmed = jest.fn().mockResolvedValue(undefined);
const mockGetGeoJsonData = jest.fn();
const mockHasAlreadySentForDate = jest.fn().mockResolvedValue(false);
const mockMarkDateAsSent = jest.fn().mockResolvedValue(undefined);
const mockWriteLastRunLog = jest.fn().mockResolvedValue(undefined);

jest.mock("web-push", () => ({
  __esModule: true,
  default: {
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/lib/emailSubscriptions", () => ({
  getConfirmedEmailSubs: () => mockGetConfirmedEmailSubs(),
  pruneExpiredUnconfirmed: () => mockPruneExpiredUnconfirmed(),
  addEmailSub: (email: string) => mockAddEmailSub(email),
}));

jest.mock("@/lib/mailer", () => ({
  sendEmail: (to: string, subject: string, html: string) =>
    mockSendEmail(to, subject, html),
}));

jest.mock("@/lib/notifyLog", () => ({
  hasAlreadySentForDate: (date: string) => mockHasAlreadySentForDate(date),
  markDateAsSent: (date: string) => mockMarkDateAsSent(date),
  writeLastRunLog: (data: unknown) => mockWriteLastRunLog(data),
}));

jest.mock("@/lib/dataCache", () => ({
  getGeoJsonData: () => mockGetGeoJsonData(),
}));

jest.mock("@/lib/subscriptions", () => ({
  readSubscriptions: jest.fn().mockReturnValue([]),
  removeSubscription: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue(true), // true = request is allowed
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { GET as notifyGET } from "@/app/api/notify/route";
import { POST as subscribePost } from "@/app/api/email-subscribe/route";
import config from "@/config";

const PROD_URL = "https://lueneburg-sperrmuell-heute.vercel.app";

const EMAIL_SUB = {
  email: "subscriber@example.com",
  token: "test-token-xyz",
  confirmed: true,
  createdAt: "2024-01-01T00:00:00.000Z",
};

/** Returns GeoJSON data with tomorrow's date so the notify route sends notifications. */
function makeTomorrowData() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const days = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
  const dateStr = `${days[d.getDay()]} ${dd}.${mm}.${yyyy}`;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [10.19, 53.72] },
        properties: {
          region: "Lüneburg",
          street: "Musterstraße",
          address: "Musterstraße 1",
          waste_schedules: { Sperrmüll: [dateStr] },
        },
      },
    ],
  };
}

// ─── /api/notify ───────────────────────────────────────────────────────────────

describe("/api/notify – email URL is always the production URL", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_BASE_URL;
    mockGetConfirmedEmailSubs.mockResolvedValue([EMAIL_SUB]);
    mockGetGeoJsonData.mockResolvedValue(makeTomorrowData());
    mockHasAlreadySentForDate.mockResolvedValue(false);
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  it("config.productionUrl matches the expected production domain", () => {
    expect(config.productionUrl).toBe(PROD_URL);
  });

  it("uses config.productionUrl in notification email when NEXT_PUBLIC_BASE_URL is not set", async () => {
    const req = new NextRequest("http://preview-abc123.vercel.app/api/notify?force=true");
    await notifyGET(req);

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain(PROD_URL);
  });

  it("Karte öffnen button href points to the production URL", async () => {
    const req = new NextRequest("http://preview-abc123.vercel.app/api/notify?force=true");
    await notifyGET(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain(`href="${PROD_URL}"`);
  });

  it("does not use the request host (preview URL) in the email", async () => {
    const req = new NextRequest("http://preview-abc123.vercel.app/api/notify?force=true");
    await notifyGET(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).not.toContain("preview-abc123.vercel.app");
  });

  it("respects NEXT_PUBLIC_BASE_URL when explicitly set", async () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://staging.example.com";
    const req = new NextRequest("http://preview-abc123.vercel.app/api/notify?force=true");
    await notifyGET(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain("https://staging.example.com");
    expect(html).not.toContain("preview-abc123.vercel.app");
  });

  it("unsubscribe link in email also uses the production URL", async () => {
    const req = new NextRequest("http://preview-abc123.vercel.app/api/notify?force=true");
    await notifyGET(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain(`${PROD_URL}/api/email-unsubscribe`);
  });
});

// ─── /api/email-subscribe ──────────────────────────────────────────────────────

describe("/api/email-subscribe – confirmation email URL is always the production URL", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_BASE_URL;
    mockAddEmailSub.mockResolvedValue("confirm-token-abc");
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  function makeSubscribeRequest(previewHost: string) {
    return new NextRequest(`https://${previewHost}/api/email-subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: previewHost,
        "x-forwarded-host": previewHost,
      },
      body: JSON.stringify({ email: "new@example.com" }),
    });
  }

  it("uses config.productionUrl in confirmation email when NEXT_PUBLIC_BASE_URL is not set", async () => {
    const req = makeSubscribeRequest("preview-xyz.vercel.app");
    await subscribePost(req);

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain(PROD_URL);
  });

  it("confirmation link does not point to a preview host", async () => {
    const req = makeSubscribeRequest("preview-xyz.vercel.app");
    await subscribePost(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).not.toContain("preview-xyz.vercel.app");
  });

  it("confirmation link uses production URL as base", async () => {
    const req = makeSubscribeRequest("preview-xyz.vercel.app");
    await subscribePost(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain(`${PROD_URL}/api/email-confirm?token=confirm-token-abc`);
  });

  it("respects NEXT_PUBLIC_BASE_URL when explicitly set", async () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://staging.example.com";
    const req = makeSubscribeRequest("preview-xyz.vercel.app");
    await subscribePost(req);

    const [, , html] = mockSendEmail.mock.calls[0] as [string, string, string];
    expect(html).toContain("https://staging.example.com");
    expect(html).not.toContain("preview-xyz.vercel.app");
  });
});
