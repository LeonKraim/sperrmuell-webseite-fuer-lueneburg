/**
 * Tests for clientLogger.ts
 * Since clientLogger calls fetch() for error reporting, we mock fetch.
 */

// Mock fetch before importing
const mockFetch = jest.fn().mockResolvedValue({ ok: true });
global.fetch = mockFetch;

import { clientLogger } from "@/lib/clientLogger";

describe("clientLogger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("log", () => {
    it("calls console.log with provided arguments", () => {
      clientLogger.log("hello", "world");
      expect(console.log).toHaveBeenCalledWith("hello", "world");
    });

    it("does not send to server", () => {
      clientLogger.log("test");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("warn", () => {
    it("calls console.warn with provided arguments", () => {
      clientLogger.warn("warning msg");
      expect(console.warn).toHaveBeenCalledWith("warning msg");
    });

    it("does not send to server", () => {
      clientLogger.warn("test");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("error", () => {
    it("calls console.error with message and error", () => {
      const err = new Error("test error");
      clientLogger.error("something failed", err);
      expect(console.error).toHaveBeenCalledWith("something failed", err);
    });

    it("sends error to server via fetch", async () => {
      const err = new Error("test error");
      clientLogger.error("something failed", err);

      // Wait for the async fetch to be called
      await new Promise((r) => setTimeout(r, 10));

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/log");
      expect(options.method).toBe("POST");

      const body = JSON.parse(options.body);
      expect(body.level).toBe("error");
      expect(body.message).toBe("something failed");
      expect(body.stack).toBe(err.stack);
      expect(body.timestamp).toBeDefined();
    });

    it("works without error object", async () => {
      clientLogger.error("simple error");
      expect(console.error).toHaveBeenCalledWith("simple error", undefined);

      await new Promise((r) => setTimeout(r, 10));
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.stack).toBeUndefined();
    });

    it("silently handles fetch failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("network error"));
      // Should not throw
      expect(() => clientLogger.error("test")).not.toThrow();
      await new Promise((r) => setTimeout(r, 10));
    });
  });
});
