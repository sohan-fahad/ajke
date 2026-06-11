import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { CmsService } from "./cms.service";

const service = new CmsService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

function cmsPayload(overrides: Record<string, unknown> = {}) {
  return { title: "Test Banner", type: "BANNER", ...overrides };
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM cms").run();
});

describe("CmsService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("CmsService.create", () => {
  it("creates a cms item and returns it with an id", async () => {
    const created = await service.create(cmsPayload(), makeContext());

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Test Banner");
    expect(created.type).toBe("BANNER");
    expect(created.isActive).toBe(true);

    const row = await env.DB.prepare("SELECT title, type, is_active FROM cms WHERE id = ?")
      .bind(created.id)
      .first<{ title: string; type: string; is_active: number }>();

    expect(row?.title).toBe("Test Banner");
    expect(row?.type).toBe("BANNER");
    expect(row?.is_active).toBe(1);
  });
});

describe("CmsService.createMany", () => {
  it("batch-inserts multiple cms items and returns them all", async () => {
    const payloads = [
      cmsPayload({ title: "Banner A", type: "BANNER" }),
      cmsPayload({ title: "Popup B", type: "POPUP" }),
      cmsPayload({ title: "Slider C", type: "SLIDER" }),
    ];

    const results = await service.createMany(payloads, makeContext());

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title).sort()).toEqual(["Banner A", "Popup B", "Slider C"].sort());

    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM cms").first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createMany([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("CmsService.findAll", () => {
  it("returns empty array when no items exist", async () => {
    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all cms items", async () => {
    await service.create(cmsPayload({ type: "BANNER" }), makeContext());
    await service.create(cmsPayload({ type: "POPUP" }), makeContext());

    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by type", async () => {
    await service.create(cmsPayload({ type: "BANNER" }), makeContext());
    await service.create(cmsPayload({ type: "POPUP" }), makeContext());

    const result = await service.findAll({ type: "BANNER" }, makeContext());
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("BANNER");
  });

  it("filters by isActive", async () => {
    await service.create(cmsPayload({ isActive: true }), makeContext());
    await service.create(cmsPayload({ isActive: false }), makeContext());

    const active = await service.findAll({ isActive: "true" }, makeContext());
    expect(active).toHaveLength(1);
    expect(active[0]?.isActive).toBe(true);
  });
});

describe("CmsService.findOne", () => {
  it("returns a cms item by id", async () => {
    const created = await service.create(cmsPayload(), makeContext());
    const found = await service.findOne(created.id, makeContext());

    expect(found.id).toBe(created.id);
    expect(found.title).toBe("Test Banner");
  });

  it("throws when cms item does not exist", async () => {
    await expect(service.findOne("nonexistent-id", makeContext())).rejects.toThrow(
      "CMS item not found",
    );
  });
});

describe("CmsService.update", () => {
  it("updates title and returns updated record", async () => {
    const created = await service.create(cmsPayload(), makeContext());
    const updated = await service.update(created.id, { title: "Updated Banner" }, makeContext());

    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe("Updated Banner");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when cms item does not exist", async () => {
    await expect(
      service.update("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("CMS item not found");
  });
});

describe("CmsService.remove", () => {
  it("deletes a cms item and returns confirmation", async () => {
    const created = await service.create(cmsPayload(), makeContext());
    const result = await service.remove(created.id, makeContext());

    expect(result.message).toBe("Deleted");

    const row = await env.DB.prepare("SELECT id FROM cms WHERE id = ?")
      .bind(created.id)
      .first();
    expect(row).toBeNull();
  });
});
