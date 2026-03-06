/**
 * Tests for lib/subscriptions.ts
 * Mocks @vercel/blob to avoid real network calls.
 */

import { put, list, get } from "@vercel/blob";

jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
  list: jest.fn(),
  get: jest.fn(),
}));

const makeSub = (endpoint: string) => ({
  endpoint,
  keys: { p256dh: "p256dh-key", auth: "auth-key" },
});

const makeBlobEntry = (pathname: string) => ({ url: `https://blob.example.com/${pathname}`, pathname });

/** Creates a mock return value for get() whose stream resolves to the given data. */
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
    blob: { url: "", downloadUrl: "", pathname: BLOB_PATHNAME, contentDisposition: "", cacheControl: "", uploadedAt: new Date(), etag: "", contentType: "application/json", size: text.length },
  };
}

const BLOB_PATHNAME = "subscriptions/subscriptions.json";

// Re-import fresh each test to avoid module-level state leaking
async function freshImport() {
  jest.resetModules();
  jest.mock("@vercel/blob", () => ({
    put: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
  }));
  const blobMod = await import("@vercel/blob");
  const mod = await import("@/lib/subscriptions");
  return {
    ...mod,
    mockedList: jest.mocked(blobMod.list),
    mockedPut: jest.mocked(blobMod.put),
    mockedGet: jest.mocked(blobMod.get),
  };
}

// This test uses the real (unmocked) @vercel/blob module to verify that the
// functions we depend on actually exist. It would have caught the download→get
// rename bug that the mock-only tests missed.
describe("@vercel/blob API contract", () => {
  it("exports get, put and list", () => {
    const real = jest.requireActual<typeof import("@vercel/blob")>("@vercel/blob");
    expect(typeof real.get).toBe("function");
    expect(typeof real.put).toBe("function");
    expect(typeof real.list).toBe("function");
  });
});

describe("readSubscriptions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty array when no blob exists", async () => {
    const { readSubscriptions, mockedList: ml } = await freshImport();
    ml.mockResolvedValue({ blobs: [] } as Awaited<ReturnType<typeof list>>);
    expect(await readSubscriptions()).toEqual([]);
  });

  it("returns parsed subscriptions when blob exists", async () => {
    const { readSubscriptions, mockedList: ml, mockedGet: mg } = await freshImport();
    const subs = [makeSub("https://example.com/push/1")];
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(makeGetResult(subs));
    expect(await readSubscriptions()).toEqual(subs);
  });

  it("returns empty array when get returns null (blob not found)", async () => {
    const { readSubscriptions, mockedList: ml, mockedGet: mg } = await freshImport();
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(null);
    expect(await readSubscriptions()).toEqual([]);
  });

  it("returns empty array when list throws", async () => {
    const { readSubscriptions, mockedList: ml } = await freshImport();
    ml.mockRejectedValue(new Error("network error"));
    expect(await readSubscriptions()).toEqual([]);
  });

  it("returns empty array when get throws", async () => {
    const { readSubscriptions, mockedList: ml, mockedGet: mg } = await freshImport();
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockRejectedValue(new Error("get failed"));
    expect(await readSubscriptions()).toEqual([]);
  });

  it("passes { access: 'private' } to get", async () => {
    const { readSubscriptions, mockedList: ml, mockedGet: mg } = await freshImport();
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(makeGetResult([]));
    await readSubscriptions();
    expect(mg).toHaveBeenCalledWith(BLOB_PATHNAME, expect.objectContaining({ access: "private" }));
  });
});

describe("writeSubscriptions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls put with correct pathname and JSON content", async () => {
    const { writeSubscriptions, mockedPut: mp } = await freshImport();
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    const subs = [makeSub("https://example.com/push/1")];
    await writeSubscriptions(subs);
    expect(mp).toHaveBeenCalledWith(
      "subscriptions/subscriptions.json",
      expect.stringContaining("https://example.com/push/1"),
      expect.objectContaining({ access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" })
    );
  });

  it("calls put with empty JSON array for empty list", async () => {
    const { writeSubscriptions, mockedPut: mp } = await freshImport();
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await writeSubscriptions([]);
    const putBody = mp.mock.calls[0][1] as string;
    expect(JSON.parse(putBody)).toEqual([]);
  });
});

describe("addSubscription", () => {
  beforeEach(() => jest.clearAllMocks());

  it("adds a new subscription to an empty list", async () => {
    const { addSubscription, mockedList: ml, mockedPut: mp } = await freshImport();
    ml.mockResolvedValue({ blobs: [] } as Awaited<ReturnType<typeof list>>);
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    const sub = makeSub("https://example.com/push/new");
    await addSubscription(sub);
    const written = JSON.parse(mp.mock.calls[0][1] as string);
    expect(written).toHaveLength(1);
    expect(written[0].endpoint).toBe(sub.endpoint);
  });

  it("does not write when endpoint already exists", async () => {
    const { addSubscription, mockedList: ml, mockedPut: mp, mockedGet: mg } = await freshImport();
    const sub = makeSub("https://example.com/push/dup");
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(makeGetResult([sub]));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await addSubscription(sub);
    expect(mp).not.toHaveBeenCalled();
  });

  it("adds a second distinct subscription", async () => {
    const { addSubscription, mockedList: ml, mockedPut: mp, mockedGet: mg } = await freshImport();
    const existing = makeSub("https://example.com/push/1");
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(makeGetResult([existing]));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await addSubscription(makeSub("https://example.com/push/2"));
    const written = JSON.parse(mp.mock.calls[0][1] as string);
    expect(written).toHaveLength(2);
  });
});

describe("removeSubscription", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removes the matching subscription", async () => {
    const { removeSubscription, mockedList: ml, mockedPut: mp, mockedGet: mg } = await freshImport();
    const subs = [makeSub("https://example.com/push/1"), makeSub("https://example.com/push/2")];
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(makeGetResult(subs));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await removeSubscription("https://example.com/push/1");
    const written = JSON.parse(mp.mock.calls[0][1] as string);
    expect(written).toHaveLength(1);
    expect(written[0].endpoint).toBe("https://example.com/push/2");
  });

  it("writes unchanged list when endpoint is not found", async () => {
    const { removeSubscription, mockedList: ml, mockedPut: mp, mockedGet: mg } = await freshImport();
    const subs = [makeSub("https://example.com/push/1")];
    ml.mockResolvedValue({ blobs: [makeBlobEntry(BLOB_PATHNAME)] } as Awaited<ReturnType<typeof list>>);
    mg.mockResolvedValue(makeGetResult(subs));
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await removeSubscription("https://example.com/push/nonexistent");
    const written = JSON.parse(mp.mock.calls[0][1] as string);
    expect(written).toHaveLength(1);
  });

  it("handles removing from an empty list without throwing", async () => {
    const { removeSubscription, mockedList: ml, mockedPut: mp } = await freshImport();
    ml.mockResolvedValue({ blobs: [] } as Awaited<ReturnType<typeof list>>);
    mp.mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    await expect(removeSubscription("https://example.com/push/any")).resolves.not.toThrow();
  });
});
