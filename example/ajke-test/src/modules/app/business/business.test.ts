import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { BusinessService } from "./business.service";

const BUSINESS_PAYLOAD = { deliveryCharge: 50 };
const service = new BusinessService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM business_configs").run();
});

describe("BusinessService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("BusinessService.create", () => {
  it("creates a business config with deliveryCharge", async () => {
    const created = await service.create(BUSINESS_PAYLOAD, makeContext());

    expect(created.id).toBeDefined();
    expect(created.deliveryCharge).toBe(50);
    expect(created.isActive).toBe(true);

    const row = await env.DB.prepare(
      "SELECT id, delivery_charge, is_active FROM business_configs WHERE id = ?",
    )
      .bind(created.id)
      .first<{ id: string; delivery_charge: number; is_active: number }>();

    expect(row).not.toBeNull();
    expect(row?.delivery_charge).toBe(50);
    expect(row?.is_active).toBe(1);
  });

  it("creates with isActive set to false", async () => {
    const created = await service.create({ deliveryCharge: 10, isActive: false }, makeContext());
    expect(created.isActive).toBe(false);
  });
});

describe("BusinessService.findAll", () => {
  it("returns empty array when no configs exist", async () => {
    const all = await service.findAll(makeContext());
    expect(all).toHaveLength(0);
  });

  it("returns all business configs", async () => {
    await service.create({ deliveryCharge: 10 }, makeContext());
    await service.create({ deliveryCharge: 20 }, makeContext());

    const all = await service.findAll(makeContext());
    expect(all).toHaveLength(2);
  });
});

describe("BusinessService.findOne", () => {
  it("returns a business config by id", async () => {
    const created = await service.create(BUSINESS_PAYLOAD, makeContext());

    const found = await service.findOne(created.id, makeContext());

    expect(found.id).toBe(created.id);
    expect(found.deliveryCharge).toBe(50);
    expect(found.isActive).toBe(true);
  });

  it("throws when business config does not exist", async () => {
    await expect(
      service.findOne("nonexistent-config-id", makeContext()),
    ).rejects.toThrow("Business config not found");
  });
});

describe("BusinessService.findByOrganizationId", () => {
  it("returns null when no config exists for the organization", async () => {
    const result = await service.findByOrganizationId("org-999", makeContext());
    expect(result).toBeNull();
  });
});

describe("BusinessService.update", () => {
  it("updates deliveryCharge", async () => {
    const created = await service.create(BUSINESS_PAYLOAD, makeContext());

    const updated = await service.update(created.id, { deliveryCharge: 99 }, makeContext());

    expect(updated.id).toBe(created.id);
    expect(updated.deliveryCharge).toBe(99);
    expect(updated.updatedAt).toBeDefined();
  });

  it("updates isActive", async () => {
    const created = await service.create(BUSINESS_PAYLOAD, makeContext());
    const updated = await service.update(created.id, { isActive: false }, makeContext());
    expect(updated.isActive).toBe(false);
  });

  it("throws when config does not exist", async () => {
    await expect(
      service.update("nonexistent-config-id", { deliveryCharge: 100 }, makeContext()),
    ).rejects.toThrow("Business config not found");
  });
});

describe("BusinessService.remove", () => {
  it("deletes a business config by id", async () => {
    const created = await service.create(BUSINESS_PAYLOAD, makeContext());

    const result = await service.remove(created.id, makeContext());
    expect(result.message).toBe("Deleted");

    const row = await env.DB.prepare("SELECT id FROM business_configs WHERE id = ?")
      .bind(created.id)
      .first();
    expect(row).toBeNull();
  });

  it("throws when config does not exist", async () => {
    await expect(
      service.remove("nonexistent-config-id", makeContext()),
    ).rejects.toThrow("Business config not found");
  });
});

describe("BusinessService.upsert", () => {
  it("creates a config when none exists", async () => {
    const result = await service.upsert({ deliveryCharge: 75 }, makeContext());

    expect(result.id).toBeDefined();
    expect(result.deliveryCharge).toBe(75);
  });

  it("updates existing config when one already exists", async () => {
    const first = await service.upsert({ deliveryCharge: 10 }, makeContext());
    const second = await service.upsert({ deliveryCharge: 99 }, makeContext());

    expect(second.id).toBe(first.id);
    expect(second.deliveryCharge).toBe(99);

    const row = await env.DB.prepare("SELECT COUNT(*) as count FROM business_configs").first<{ count: number }>();
    expect(row?.count).toBe(1);
  });
});
