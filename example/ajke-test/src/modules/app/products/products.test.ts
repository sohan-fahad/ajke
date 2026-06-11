import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { ProductsService } from "./products.service";

const service = new ProductsService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

function productPayload(overrides: Record<string, unknown> = {}) {
  return { title: "Test Product", code: `P-${Date.now()}`, ...overrides };
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM product_zone_mappings").run();
  await env.DB.prepare("DELETE FROM product_ratings").run();
  await env.DB.prepare("DELETE FROM product_variant_options").run();
  await env.DB.prepare("DELETE FROM product_images").run();
  await env.DB.prepare("DELETE FROM product_discounts").run();
  await env.DB.prepare("DELETE FROM product_stats").run();
  await env.DB.prepare("DELETE FROM products").run();
  await env.DB.prepare("DELETE FROM variant_options").run();
  await env.DB.prepare("DELETE FROM variants").run();
});

describe("ProductsService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("ProductsService.create", () => {
  it("creates a product and auto-creates productStats in a single batch", async () => {
    const product = await service.create(productPayload(), makeContext());

    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.title).toBe("Test Product");

    const statsRow = await env.DB.prepare(
      "SELECT product_id FROM product_stats WHERE product_id = ?",
    )
      .bind(product.id)
      .first<{ product_id: string }>();

    expect(statsRow?.product_id).toBe(product.id);
  });

  it("findOne returns product with images, stats, and variants", async () => {
    const product = await service.create(productPayload({ title: "Full Product" }), makeContext());

    const found = await service.findOne(product.id, makeContext());

    expect(found.id).toBe(product.id);
    expect(found.images).toBeInstanceOf(Array);
    expect(found.variants).toBeInstanceOf(Array);
    expect(found.stats).not.toBeUndefined();
  });
});

describe("ProductsService.createMany (batch)", () => {
  it("batch-creates multiple products each with productStats", async () => {
    const payloads = [
      productPayload({ title: "Product A", code: "PA-001" }),
      productPayload({ title: "Product B", code: "PB-002" }),
      productPayload({ title: "Product C", code: "PC-003" }),
    ];

    const results = await service.createMany(payloads, makeContext());

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title).sort()).toEqual(["Product A", "Product B", "Product C"]);

    const productCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM products",
    ).first<{ count: number }>();
    expect(productCount?.count).toBe(3);

    const statsCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM product_stats",
    ).first<{ count: number }>();
    expect(statsCount?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createMany([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("ProductsService.findAll", () => {
  it("returns empty when no products", async () => {
    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all products paginated", async () => {
    await service.create(productPayload({ title: "A" }), makeContext());
    await service.create(productPayload({ title: "B" }), makeContext());

    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by status", async () => {
    await service.create(productPayload({ status: "published" }), makeContext());
    await service.create(productPayload({ status: "drafted" }), makeContext());

    const result = await service.findAll({ status: "published" }, makeContext());
    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe("published");
  });
});

describe("ProductsService.findOne", () => {
  it("throws when product does not exist", async () => {
    await expect(service.findOne("nonexistent-id", makeContext())).rejects.toThrow(
      "Product not found",
    );
  });
});

describe("ProductsService.update", () => {
  it("updates product title", async () => {
    const product = await service.create(productPayload(), makeContext());
    const updated = await service.update(product.id, { title: "Updated Product" }, makeContext());

    expect(updated.title).toBe("Updated Product");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when product does not exist", async () => {
    await expect(
      service.update("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("Product not found");
  });
});

describe("ProductsService.delete", () => {
  it("soft-deletes product by setting isActive=false and deletedAt", async () => {
    const product = await service.create(productPayload(), makeContext());
    const result = await service.delete(product.id, makeContext());

    expect(result.message).toBe("Product deleted");

    const row = await env.DB.prepare(
      "SELECT is_active, deleted_at FROM products WHERE id = ?",
    )
      .bind(product.id)
      .first<{ is_active: number; deleted_at: string }>();

    expect(row?.is_active).toBe(0);
    expect(row?.deleted_at).not.toBeNull();
  });
});

describe("ProductsService.addImage / deleteImage", () => {
  it("adds an image to a product and deletes it", async () => {
    const product = await service.create(productPayload(), makeContext());
    const img = await service.addImage(product.id, { link: "https://example.com/img.jpg" }, makeContext());

    expect(img.id).toBeDefined();
    expect(img.link).toBe("https://example.com/img.jpg");
    expect(img.productId).toBe(product.id);

    const result = await service.deleteImage(img.id, makeContext());
    expect(result.message).toBe("Image deleted");

    const row = await env.DB.prepare("SELECT id FROM product_images WHERE id = ?")
      .bind(img.id)
      .first();
    expect(row).toBeNull();
  });
});

describe("ProductsService.variants", () => {
  it("creates a variant and its options", async () => {
    const variant = await service.createVariant(
      { title: "Color", slug: "color" },
      makeContext(),
    );

    expect(variant.id).toBeDefined();
    expect(variant.title).toBe("Color");

    const option = await service.createVariantOption(
      { title: "Red", slug: "red", variantId: variant.id },
      makeContext(),
    );

    expect(option.id).toBeDefined();
    expect(option.title).toBe("Red");

    const options = await service.findAllVariantOptions(variant.id, makeContext());
    expect(options).toHaveLength(1);
    expect(options[0]?.slug).toBe("red");
  });
});
