/**
 * Tests for API route: /api/log
 */

import { NextRequest } from "next/server";

jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { POST } from "@/app/api/log/route";
import logger from "@/lib/logger";

const mockedLogger = logger as jest.Mocked<typeof logger>;

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/log", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with ok:true for valid request", async () => {
    const response = await POST(
      createRequest({
        level: "error",
        message: "Client error occurred",
        stack: "Error: test\n  at foo.js:1",
        userAgent: "TestBrowser/1.0",
        timestamp: "2026-01-27T12:00:00.000Z",
      })
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("calls logger.log with client error", async () => {
    await POST(
      createRequest({
        level: "error",
        message: "Client error occurred",
        stack: "some stack",
        userAgent: "TestBrowser",
        timestamp: "2026-01-27T12:00:00.000Z",
      })
    );

    expect(mockedLogger.log).toHaveBeenCalledTimes(1);
    const callArgs = mockedLogger.log.mock.calls[0][0];
    expect(callArgs.level).toBe("error");
    expect(callArgs.message).toContain("[CLIENT]");
    expect(callArgs.message).toContain("Client error occurred");
  });

  it("defaults level to error when not provided", async () => {
    await POST(
      createRequest({
        message: "No level provided",
      })
    );

    expect(mockedLogger.log).toHaveBeenCalledTimes(1);
    const callArgs = mockedLogger.log.mock.calls[0][0];
    expect(callArgs.level).toBe("error");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json{{{",
    });
    const response = await POST(req);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBe("invalid_request");
  });

  it("passes through stack and userAgent", async () => {
    await POST(
      createRequest({
        level: "warn",
        message: "test",
        stack: "Error: stack trace here",
        userAgent: "Mozilla/5.0",
        timestamp: "2026-01-27T12:00:00.000Z",
      })
    );

    const callArgs = mockedLogger.log.mock.calls[0][0];
    expect(callArgs.stack).toBe("Error: stack trace here");
    expect(callArgs.userAgent).toBe("Mozilla/5.0");
    expect(callArgs.timestamp).toBe("2026-01-27T12:00:00.000Z");
  });
});
