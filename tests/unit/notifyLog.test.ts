/**
 * Tests for lib/notifyLog.ts
 * Mocks @vercel/blob to avoid real network calls.
 */

import { put, list, get } from "@vercel/blob";
import type { NotifyRunLog } from "@/lib/notifyLog";

jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
  list: jest.fn(),
  get: jest.fn(),
}));

// ---- helpers ----------------------------------------------------------------

const SENT_DATES_PATH = "notify-log/sent-dates.json";
const LAST_RUN_PATH = "notify-log/last-run.json";

function makeGetResult(data: unknown): Awaited<ReturnType<typeof get>> {
  const text = JSON.stringify(data);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return {
    statusCode: 200,
    stream,
    headers: new Headers(),
    blob: {
      url: "",
      downloadUrl: "",
      pathname: SENT_DATES_PATH,
      contentDisposition: "",
      cacheControl: "",
      uploadedAt: new Date(),
      etag: "",
      contentType: "application/json",
      size: text.length,
    },
  };
}

function makeEmptyList(): Awaited<ReturnType<typeof list>> {
  return { blobs: [], cursor: undefined, hasMore: false } as Awaited<ReturnType<typeof list>>;
}

function makeBlobList(pathname: string): Awaited<ReturnType<typeof list>> {
  return {
    blobs: [{ url: `https://blob.example.com/${pathname}`, pathname, downloadUrl: "", size: 0, uploadedAt: new Date(), contentType: "application/json", etag: "", cacheControl: "", contentDisposition: "" }],
    cursor: undefined,
    hasMore: false,
  } as Awaited<ReturnType<typeof list>>;
}

async function freshImport() {
  jest.resetModules();
  jest.mock("@vercel/blob", () => ({
    put: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
  }));
  const blobMod = await import("@vercel/blob");
  const mod = await import("@/lib/notifyLog");
  return {
    ...mod,
    ml: jest.mocked(blobMod.list),
    mp: jest.mocked(blobMod.put),
    mg: jest.mocked(blobMod.get),
  };
}

// ---- contract ---------------------------------------------------------------

describe("@vercel/blob API contract", () => {
  it("exports get, put and list", () => {
    const real = jest.requireActual<typeof import("@vercel/blob")>("@vercel/blob");
    expect(typeof real.get).toBe("function");
    expect(typeof real.put).toBe("function");
    expect(typeof real.list).toBe("function");
  });
});

// ---- hasAlreadySentForDate --------------------------------------------------

describe("hasAlreadySentForDate", () => {
  it("returns false when no blob exists", async () => {
    const { hasAlreadySentForDate, ml } = await freshImport();
    ml.mockResolvedValue(makeEmptyList());
    expect(await hasAlreadySentForDate("07.03.2026")).toBe(false);
  });

  it("returns true when date is in the stored list", async () => {
    const { hasAlreadySentForDate, ml, mg } = await freshImport();
    ml.mockResolvedValue(makeBlobList(SENT_DATES_PATH));
    mg.mockResolvedValue(makeGetResult(["05.03.2026", "07.03.2026"]));
    expect(await hasAlreadySentForDate("07.03.2026")).toBe(true);
  });

  it("returns false when date is not in the stored list", async () => {
    const { hasAlreadySentForDate, ml, mg } = await freshImport();
    ml.mockResolvedValue(makeBlobList(SENT_DATES_PATH));
    mg.mockResolvedValue(makeGetResult(["05.03.2026"]));
    expect(await hasAlreadySentForDate("07.03.2026")).toBe(false);
  });

  it("returns false when blob read throws", async () => {
    const { hasAlreadySentForDate, ml } = await freshImport();
    ml.mockRejectedValue(new Error("network error"));
    expect(await hasAlreadySentForDate("07.03.2026")).toBe(false);
  });
});

// ---- markDateAsSent ---------------------------------------------------------

describe("markDateAsSent", () => {
  it("writes a new list with the date when store is empty", async () => {
    const { markDateAsSent, ml, mp } = await freshImport();
    ml.mockResolvedValue(makeEmptyList());
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await markDateAsSent("07.03.2026");
    expect(mp).toHaveBeenCalledWith(
      SENT_DATES_PATH,
      expect.stringContaining("07.03.2026"),
      expect.objectContaining({ allowOverwrite: true })
    );
  });

  it("appends to existing dates", async () => {
    const { markDateAsSent, ml, mg, mp } = await freshImport();
    ml.mockResolvedValue(makeBlobList(SENT_DATES_PATH));
    mg.mockResolvedValue(makeGetResult(["05.03.2026"]));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await markDateAsSent("07.03.2026");
    const written = JSON.parse((mp.mock.calls[0][1] as string));
    expect(written).toContain("05.03.2026");
    expect(written).toContain("07.03.2026");
  });

  it("does not write when date already exists", async () => {
    const { markDateAsSent, ml, mg, mp } = await freshImport();
    ml.mockResolvedValue(makeBlobList(SENT_DATES_PATH));
    mg.mockResolvedValue(makeGetResult(["07.03.2026"]));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await markDateAsSent("07.03.2026");
    expect(mp).not.toHaveBeenCalled();
  });

  it("trims to the last 30 entries", async () => {
    const { markDateAsSent, ml, mg, mp } = await freshImport();
    const existing = Array.from({ length: 30 }, (_, i) => `${String(i + 1).padStart(2, "0")}.01.2026`);
    ml.mockResolvedValue(makeBlobList(SENT_DATES_PATH));
    mg.mockResolvedValue(makeGetResult(existing));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await markDateAsSent("07.03.2026");
    const written: string[] = JSON.parse((mp.mock.calls[0][1] as string));
    expect(written).toHaveLength(30);
    expect(written[written.length - 1]).toBe("07.03.2026");
    expect(written[0]).toBe("02.01.2026"); // oldest was dropped
  });
});

// ---- writeLastRunLog / readLastRunLog ---------------------------------------

describe("writeLastRunLog", () => {
  it("puts the log at the correct path", async () => {
    const { writeLastRunLog, mp } = await freshImport();
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    const log: NotifyRunLog = { runAt: "2026-03-06T21:59:00Z", collectionDate: "07.03.2026", sent: 3, failed: 0, skipped: false };
    await writeLastRunLog(log);
    expect(mp).toHaveBeenCalledWith(
      LAST_RUN_PATH,
      expect.stringContaining("07.03.2026"),
      expect.objectContaining({ allowOverwrite: true })
    );
  });
});

describe("readLastRunLog", () => {
  it("returns null when no blob exists", async () => {
    const { readLastRunLog, ml } = await freshImport();
    ml.mockResolvedValue(makeEmptyList());
    expect(await readLastRunLog()).toBeNull();
  });

  it("returns the stored log", async () => {
    const { readLastRunLog, ml, mg } = await freshImport();
    const log: NotifyRunLog = { runAt: "2026-03-06T21:59:00Z", collectionDate: "07.03.2026", sent: 2, failed: 0, skipped: false };
    ml.mockResolvedValue(makeBlobList(LAST_RUN_PATH));
    mg.mockResolvedValue(makeGetResult(log));
    expect(await readLastRunLog()).toEqual(log);
  });

  it("returns null when read throws", async () => {
    const { readLastRunLog, ml } = await freshImport();
    ml.mockRejectedValue(new Error("network error"));
    expect(await readLastRunLog()).toBeNull();
  });
});
