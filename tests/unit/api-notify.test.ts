/**
 * Tests for API route: /api/notify (cron-triggered push notifications)
 */

import { NextRequest } from "next/server";

// Set VAPID env vars before the module loads so webpush.setVapidDetails doesn't throw
process.env.VAPID_EMAIL = "mailto:test@example.com";
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "BO-_PMymTz9MzfL4kW3q1oNbkYD4m9Fk3NxtW3PvOhlz7mDEF0X1c7yC5pRo5CkNN1C8_69R9swVrAVDbv_icsY";
process.env.VAPID_PRIVATE_KEY = "Z5_AP0NbKBmP9dDjqlgDNfaTYda1PrX26A7njKKx5FA";

jest.mock("web-push", () => ({
  __esModule: true,
  default: {
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/lib/subscriptions", () => ({
  readSubscriptions: jest.fn().mockReturnValue([]),
  removeSubscription: jest.fn(),
}));

jest.mock("@/lib/dataCache", () => ({
  getGeoJsonData: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import webpush from "web-push";
import { GET } from "@/app/api/notify/route";
import { readSubscriptions, removeSubscription } from "@/lib/subscriptions";
import { getGeoJsonData } from "@/lib/dataCache";

const mockedSendNotification = (webpush.sendNotification as jest.Mock);
const mockedReadSubscriptions = readSubscriptions as jest.MockedFunction<typeof readSubscriptions>;
const mockedRemoveSubscription = removeSubscription as jest.MockedFunction<typeof removeSubscription>;
const mockedGetGeoJsonData = getGeoJsonData as jest.MockedFunction<typeof getGeoJsonData>;

// Build a GeoJSON feature with tomorrow's date in its schedules
function makeDataWithDate(dateStr: string) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [10.0, 53.0] },
        properties: {
          region: "Test",
          street: "Musterstraße",
          address: "Musterstraße 1",
          waste_schedules: { Sperrmüll: [dateStr] },
        },
      },
    ],
  };
}

function tomorrowGermanDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const days = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
  return `${days[d.getDay()]} ${dd}.${mm}.${yyyy}`;
}

const VALID_SUB = {
  endpoint: "https://fcm.googleapis.com/fcm/send/test",
  keys: { p256dh: "p256dh", auth: "auth" },
} as import("web-push").PushSubscription;

function makeRequest(headers: Record<string, string> = {}, url = "http://localhost:3000/api/notify"): NextRequest {
  return new NextRequest(url, { headers });
}
function makeForceRequest(): NextRequest {
  return makeRequest({}, "http://localhost:3000/api/notify?force=true");
}

describe("GET /api/notify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CRON_SECRET;
    mockedReadSubscriptions.mockReturnValue([]);
    mockedGetGeoJsonData.mockResolvedValue(
      makeDataWithDate(tomorrowGermanDateString()) as ReturnType<typeof getGeoJsonData> extends Promise<infer T> ? T : never
    );
  });

  // ── auth ──

  it("allows request when CRON_SECRET is not set", async () => {
    const res = await GET(makeRequest());
    expect(res.status).not.toBe(401);
  });

  it("allows request with correct Bearer token", async () => {
    process.env.CRON_SECRET = "mysecret";
    const res = await GET(makeRequest({ authorization: "Bearer mysecret" }));
    expect(res.status).not.toBe(401);
  });

  it("returns 401 when CRON_SECRET is set but header is missing", async () => {
    process.env.CRON_SECRET = "mysecret";
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("unauthorized");
  });

  it("returns 401 when Bearer token is wrong", async () => {
    process.env.CRON_SECRET = "mysecret";
    const res = await GET(makeRequest({ authorization: "Bearer wrong" }));
    expect(res.status).toBe(401);
  });

  // ── data errors ──

  it("returns 500 when GeoJSON data is unavailable", async () => {
    mockedGetGeoJsonData.mockRejectedValue(new Error("data_unavailable"));
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("data_unavailable");
  });

  // ── no collections tomorrow ──

  it("returns sent:0 with reason when no collections tomorrow", async () => {
    mockedGetGeoJsonData.mockResolvedValue(
      makeDataWithDate("Mo. 01.01.2222") as ReturnType<typeof getGeoJsonData> extends Promise<infer T> ? T : never
    );
    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.sent).toBe(0);
    expect(json.reason).toBe("no_collections_tomorrow");
  });

  it("does not call sendNotification when no collections tomorrow", async () => {
    mockedGetGeoJsonData.mockResolvedValue(
      makeDataWithDate("Mo. 01.01.2222") as ReturnType<typeof getGeoJsonData> extends Promise<infer T> ? T : never
    );
    await GET(makeRequest());
    expect(mockedSendNotification).not.toHaveBeenCalled();
  });

  // ── sending notifications ──

  it("sends notifications to all subscribers when there are collections tomorrow", async () => {
    mockedReadSubscriptions.mockReturnValue([VALID_SUB, { ...VALID_SUB, endpoint: "https://fcm.googleapis.com/send/2" }]);
    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.sent).toBe(2);
    expect(mockedSendNotification).toHaveBeenCalledTimes(2);
  });

  it("returns sent:0 when subscriptions list is empty", async () => {
    mockedReadSubscriptions.mockReturnValue([]);
    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.sent).toBe(0);
  });

  it("payload contains tomorrowStr date", async () => {
    mockedReadSubscriptions.mockReturnValue([VALID_SUB]);
    await GET(makeRequest());
    const payloadStr = mockedSendNotification.mock.calls[0][1] as string;
    const payload = JSON.parse(payloadStr);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    expect(payload.body).toContain(`${dd}.${mm}.${d.getFullYear()}`);
  });

  // ── expired subscriptions ──

  it("removes subscription on 410 Gone response", async () => {
    mockedReadSubscriptions.mockReturnValue([VALID_SUB]);
    const goneErr = Object.assign(new Error("Gone"), { statusCode: 410 });
    mockedSendNotification.mockRejectedValueOnce(goneErr);
    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.sent).toBe(0);
    expect(mockedRemoveSubscription).toHaveBeenCalledWith(VALID_SUB.endpoint);
  });

  it("removes subscription on 404 Not Found response", async () => {
    mockedReadSubscriptions.mockReturnValue([VALID_SUB]);
    const notFoundErr = Object.assign(new Error("Not Found"), { statusCode: 404 });
    mockedSendNotification.mockRejectedValueOnce(notFoundErr);
    await GET(makeRequest());
    expect(mockedRemoveSubscription).toHaveBeenCalledWith(VALID_SUB.endpoint);
  });

  it("does not remove subscription on other send errors", async () => {
    mockedReadSubscriptions.mockReturnValue([VALID_SUB]);
    mockedSendNotification.mockRejectedValueOnce(Object.assign(new Error("network"), { statusCode: 500 }));
    await GET(makeRequest());
    expect(mockedRemoveSubscription).not.toHaveBeenCalled();
  });

  it("counts failed sends in response", async () => {
    mockedReadSubscriptions.mockReturnValue([VALID_SUB]);
    mockedSendNotification.mockRejectedValueOnce(Object.assign(new Error("server error"), { statusCode: 500 }));
    const res = await GET(makeRequest());
    const json = await res.json();
    expect(json.failed).toBe(1);
    expect(json.sent).toBe(0);
  });

  it("continues sending to remaining subs after one failure", async () => {
    const sub2 = { ...VALID_SUB, endpoint: "https://fcm.googleapis.com/send/2" };
    mockedReadSubscriptions.mockReturnValue([VALID_SUB, sub2]);
    mockedSendNotification
      .mockRejectedValueOnce(Object.assign(new Error("err"), { statusCode: 500 }))
      .mockResolvedValueOnce({});
    const res = await GET(makeRequest());
    const json = await res.json();
    expect(json.sent).toBe(1);
    expect(json.failed).toBe(1);
  });
});

// ───────────── ?force=true (dev-only) ─────────────

describe("GET /api/notify?force=true (development mode)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CRON_SECRET;
    // NODE_ENV is 'test' in Jest which is !== 'production', so force=true is honoured
    mockedReadSubscriptions.mockReturnValue([VALID_SUB]);
    // Data with NO collections tomorrow — force should bypass this
    mockedGetGeoJsonData.mockResolvedValue(
      makeDataWithDate("Mo. 01.01.2222") as ReturnType<typeof getGeoJsonData> extends Promise<infer T> ? T : never
    );
  });

  it("sends notification even when there are no collections tomorrow", async () => {
    const res = await GET(makeForceRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.sent).toBe(1);
  });

  it("uses the real notification title (no [Test] prefix)", async () => {
    await GET(makeForceRequest());
    const payload = JSON.parse(mockedSendNotification.mock.calls[0][1] as string);
    expect(payload.title).toBe("Sperrmüll morgen!");
    expect(payload.title).not.toContain("[Test]");
  });

  it("payload body contains the next collection date from data", async () => {
    await GET(makeForceRequest());
    const payload = JSON.parse(mockedSendNotification.mock.calls[0][1] as string);
    // getNextCollectionDateFromData falls back to tomorrowStr when no future dates exist,
    // but it must contain a date-like string (DD.MM.YYYY)
    expect(payload.body).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });

  it("does NOT send when data is unavailable even with force=true", async () => {
    mockedGetGeoJsonData.mockRejectedValue(new Error("data_unavailable"));
    const res = await GET(makeForceRequest());
    expect(res.status).toBe(500);
    expect(mockedSendNotification).not.toHaveBeenCalled();
  });
});
