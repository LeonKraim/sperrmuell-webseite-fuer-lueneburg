/**
 * Tests for API route: /api/subscribe (POST and DELETE)
 */

import { NextRequest } from "next/server";

jest.mock("@/lib/subscriptions", () => ({
  addSubscription: jest.fn(),
  removeSubscription: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { POST, DELETE } from "@/app/api/subscribe/route";
import { addSubscription, removeSubscription } from "@/lib/subscriptions";
import { checkRateLimit } from "@/lib/rateLimit";

const mockedAdd = addSubscription as jest.MockedFunction<typeof addSubscription>;
const mockedRemove = removeSubscription as jest.MockedFunction<typeof removeSubscription>;
const mockedCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const VALID_SUB = {
  endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
  keys: { p256dh: "key1", auth: "key2" },
};

function postRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deleteRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ───────────── POST ─────────────

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCheckRateLimit.mockReturnValue(true);
  });

  it("returns 201 for a valid subscription", async () => {
    const res = await POST(postRequest(VALID_SUB));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
  });

  it("calls addSubscription with the body", async () => {
    await POST(postRequest(VALID_SUB));
    expect(mockedAdd).toHaveBeenCalledWith(VALID_SUB);
  });

  it("returns 429 when rate limited", async () => {
    mockedCheckRateLimit.mockReturnValue(false);
    const res = await POST(postRequest(VALID_SUB));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe("rate_limit_exceeded");
  });

  it("returns 400 when body is missing endpoint", async () => {
    const res = await POST(postRequest({ keys: { p256dh: "k", auth: "a" } }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_subscription");
  });

  it("returns 400 when endpoint is not a string", async () => {
    const res = await POST(postRequest({ endpoint: 42 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_subscription");
  });

  it("returns 400 when endpoint is an http:// URL", async () => {
    const res = await POST(postRequest({ ...VALID_SUB, endpoint: "http://not-secure.com/push" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_endpoint");
  });

  it("returns 400 when endpoint is not a valid URL", async () => {
    const res = await POST(postRequest({ ...VALID_SUB, endpoint: "not-a-url" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_endpoint");
  });

  it("returns 400 when body is not JSON", async () => {
    const res = await POST(
      new NextRequest("http://localhost:3000/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{{not json",
      })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_body");
  });

  it("returns 500 when addSubscription throws", async () => {
    mockedAdd.mockImplementation(() => { throw new Error("disk full"); });
    const res = await POST(postRequest(VALID_SUB));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("internal_error");
  });
});

// ───────────── DELETE ─────────────

describe("DELETE /api/subscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCheckRateLimit.mockReturnValue(true);
  });

  it("returns 200 for a valid delete", async () => {
    const res = await DELETE(deleteRequest({ endpoint: VALID_SUB.endpoint }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("calls removeSubscription with the endpoint", async () => {
    await DELETE(deleteRequest({ endpoint: VALID_SUB.endpoint }));
    expect(mockedRemove).toHaveBeenCalledWith(VALID_SUB.endpoint);
  });

  it("returns 429 when rate limited", async () => {
    mockedCheckRateLimit.mockReturnValue(false);
    const res = await DELETE(deleteRequest({ endpoint: VALID_SUB.endpoint }));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe("rate_limit_exceeded");
  });

  it("returns 400 when endpoint is missing", async () => {
    const res = await DELETE(deleteRequest({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_endpoint");
  });

  it("returns 400 when endpoint is not a string", async () => {
    const res = await DELETE(deleteRequest({ endpoint: 123 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_endpoint");
  });

  it("returns 400 when body is not JSON", async () => {
    const res = await DELETE(
      new NextRequest("http://localhost:3000/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: "broken",
      })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_body");
  });

  it("returns 500 when removeSubscription throws", async () => {
    mockedRemove.mockImplementation(() => { throw new Error("io error"); });
    const res = await DELETE(deleteRequest({ endpoint: VALID_SUB.endpoint }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("internal_error");
  });
});
