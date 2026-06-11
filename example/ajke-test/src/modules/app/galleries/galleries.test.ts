import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { GalleriesService } from "./galleries.service";
import { getDb } from "@app/database/connection";
import { fileStorages } from "./galleries.entity";

const service = new GalleriesService();

const stubStorage = {
  put: async () => undefined,
  delete: async () => undefined,
  get: async () => null,
} as unknown as R2Bucket;

function makeContext(): Context {
  return { env: { ...env, STORAGE: stubStorage } } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM file_storages").run();
});

async function seedFileRecord(overrides: Record<string, unknown> = {}) {
  const db = getDb(makeContext());
  const [record] = await db
    .insert(fileStorages)
    .values({
      storageType: "R2",
      fileType: "image/jpeg",
      folder: "images",
      fileName: `test-${Date.now()}.jpg`,
      link: "https://example.com/test.jpg",
      ...overrides,
    })
    .returning();
  return record!;
}

describe("GalleriesService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("GalleriesService.uploadFile", () => {
  it("uploads a file and persists the record in DB", async () => {
    const file = new ArrayBuffer(8);
    const record = await service.uploadFile(
      file,
      "photo.jpg",
      "images",
      "image/jpeg",
      undefined,
      makeContext(),
    );

    expect(record.id).toBeDefined();
    expect(record.fileName).toBe("photo.jpg");
    expect(record.folder).toBe("images");
    expect(record.fileType).toBe("image/jpeg");
    expect(record.storageType).toBe("R2");

    const row = await env.DB.prepare("SELECT file_name, folder FROM file_storages WHERE id = ?")
      .bind(record.id)
      .first<{ file_name: string; folder: string }>();

    expect(row?.file_name).toBe("photo.jpg");
    expect(row?.folder).toBe("images");
  });
});

describe("GalleriesService.uploadFiles (batch)", () => {
  it("batch-uploads multiple files and inserts all DB records", async () => {
    const uploads = [
      { file: new ArrayBuffer(4), fileName: "a.jpg", folder: "images", fileType: "image/jpeg" },
      { file: new ArrayBuffer(4), fileName: "b.jpg", folder: "images", fileType: "image/jpeg" },
      { file: new ArrayBuffer(4), fileName: "c.png", folder: "avatars", fileType: "image/png" },
    ];

    const results = await service.uploadFiles(uploads, undefined, makeContext());

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.fileName).sort()).toEqual(["a.jpg", "b.jpg", "c.png"]);

    const count = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM file_storages",
    ).first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty uploads", async () => {
    const results = await service.uploadFiles([], undefined, makeContext());
    expect(results).toEqual([]);
  });
});

describe("GalleriesService.findAll", () => {
  it("returns empty when no files", async () => {
    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all file records", async () => {
    await seedFileRecord();
    await seedFileRecord();

    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(2);
  });
});

describe("GalleriesService.deleteFile", () => {
  it("deletes a file record from DB", async () => {
    const record = await seedFileRecord();
    const result = await service.deleteFile(record.id, makeContext());

    expect(result.message).toBe("File deleted");

    const row = await env.DB.prepare("SELECT id FROM file_storages WHERE id = ?")
      .bind(record.id)
      .first();
    expect(row).toBeNull();
  });

  it("throws when file does not exist", async () => {
    await expect(service.deleteFile("nonexistent-id", makeContext())).rejects.toThrow(
      "File not found",
    );
  });
});

describe("GalleriesService.deleteFiles (batch)", () => {
  it("batch-deletes multiple file records", async () => {
    const a = await seedFileRecord();
    const b = await seedFileRecord();
    const c = await seedFileRecord();

    const result = await service.deleteFiles([a.id, b.id], makeContext());

    expect(result.message).toBe("2 file(s) deleted");

    const remaining = await env.DB.prepare(
      "SELECT id FROM file_storages",
    ).all<{ id: string }>();

    expect(remaining.results).toHaveLength(1);
    expect(remaining.results[0]?.id).toBe(c.id);
  });

  it("returns early message for empty ids", async () => {
    const result = await service.deleteFiles([], makeContext());
    expect(result.message).toBe("No files to delete");
  });
});
