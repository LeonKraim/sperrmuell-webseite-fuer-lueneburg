/**
 * Tests for lib/subscriptions.ts
 * Mocks fs to avoid touching the real filesystem.
 */

import fs from "fs";

jest.mock("fs");
jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockedFs = jest.mocked(fs);

const makeSub = (endpoint: string) => ({
  endpoint,
  keys: { p256dh: "p256dh-key", auth: "auth-key" },
});

// Re-import fresh between tests because subscriptions.ts has no module-level state
// (unlike dataCache), but we need fs mock state to be clean.
async function freshImport() {
  jest.resetModules();
  jest.mock("fs");
  jest.mock("@/lib/logger", () => ({
    __esModule: true,
    default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  }));
  const freshFs = jest.mocked((await import("fs")).default);
  const mod = await import("@/lib/subscriptions");
  return { ...mod, fs: freshFs };
}

describe("readSubscriptions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty array when file does not exist", async () => {
    const { readSubscriptions, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(false);
    expect(readSubscriptions()).toEqual([]);
  });

  it("returns parsed subscriptions when file exists", async () => {
    const { readSubscriptions, fs: mfs } = await freshImport();
    const subs = [makeSub("https://example.com/push/1")];
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(JSON.stringify(subs));
    expect(readSubscriptions()).toEqual(subs);
  });

  it("returns empty array when file contains invalid JSON", async () => {
    const { readSubscriptions, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue("not-json{{");
    expect(readSubscriptions()).toEqual([]);
  });

  it("returns empty array when readFileSync throws", async () => {
    const { readSubscriptions, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockImplementation(() => { throw new Error("IO error"); });
    expect(readSubscriptions()).toEqual([]);
  });

  it("creates directory when it does not exist", async () => {
    const { readSubscriptions, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValueOnce(false) // dir check
                  .mockReturnValue(false);     // file check
    readSubscriptions();
    expect(mfs.mkdirSync).toHaveBeenCalled();
  });
});

describe("writeSubscriptions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("writes JSON to the file", async () => {
    const { writeSubscriptions, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(true);
    const subs = [makeSub("https://example.com/push/1")];
    writeSubscriptions(subs);
    expect(mfs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("subscriptions.json"),
      expect.stringContaining("https://example.com/push/1"),
      "utf-8"
    );
  });

  it("creates directory if missing before writing", async () => {
    const { writeSubscriptions, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(false);
    writeSubscriptions([]);
    expect(mfs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});

describe("addSubscription", () => {
  beforeEach(() => jest.clearAllMocks());

  it("adds a new subscription to an empty list", async () => {
    const { addSubscription, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(false);
    const sub = makeSub("https://example.com/push/new");
    addSubscription(sub);
    const written = JSON.parse((mfs.writeFileSync as jest.Mock).mock.calls[0][1]);
    expect(written).toHaveLength(1);
    expect(written[0].endpoint).toBe(sub.endpoint);
  });

  it("does not add a duplicate endpoint", async () => {
    const { addSubscription, fs: mfs } = await freshImport();
    const sub = makeSub("https://example.com/push/dup");
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(JSON.stringify([sub]));
    addSubscription(sub);
    // writeFileSync should NOT have been called (no change)
    expect(mfs.writeFileSync).not.toHaveBeenCalled();
  });

  it("adds a second distinct subscription", async () => {
    const { addSubscription, fs: mfs } = await freshImport();
    const existing = makeSub("https://example.com/push/1");
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(JSON.stringify([existing]));
    addSubscription(makeSub("https://example.com/push/2"));
    const written = JSON.parse((mfs.writeFileSync as jest.Mock).mock.calls[0][1]);
    expect(written).toHaveLength(2);
  });
});

describe("removeSubscription", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removes the matching subscription", async () => {
    const { removeSubscription, fs: mfs } = await freshImport();
    const subs = [
      makeSub("https://example.com/push/1"),
      makeSub("https://example.com/push/2"),
    ];
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(JSON.stringify(subs));
    removeSubscription("https://example.com/push/1");
    const written = JSON.parse((mfs.writeFileSync as jest.Mock).mock.calls[0][1]);
    expect(written).toHaveLength(1);
    expect(written[0].endpoint).toBe("https://example.com/push/2");
  });

  it("is a no-op when endpoint is not found", async () => {
    const { removeSubscription, fs: mfs } = await freshImport();
    const subs = [makeSub("https://example.com/push/1")];
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(JSON.stringify(subs));
    removeSubscription("https://example.com/push/nonexistent");
    const written = JSON.parse((mfs.writeFileSync as jest.Mock).mock.calls[0][1]);
    expect(written).toHaveLength(1);
  });

  it("removes from empty list without throwing", async () => {
    const { removeSubscription, fs: mfs } = await freshImport();
    mfs.existsSync.mockReturnValue(false);
    expect(() => removeSubscription("https://example.com/push/any")).not.toThrow();
  });
});
