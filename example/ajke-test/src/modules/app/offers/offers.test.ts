import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { OffersService } from "./offers.service";

const service = new OffersService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

const FUTURE = "2030-01-01T00:00:00.000Z";
const PAST = "2020-01-01T00:00:00.000Z";
const FAR_FUTURE = "2035-01-01T00:00:00.000Z";

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM coupons").run();
  await env.DB.prepare("DELETE FROM discounts").run();
});

describe("OffersService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

// --- Discounts ---

describe("OffersService.createDiscount", () => {
  it("creates a discount", async () => {
    const d = await service.createDiscount(
      { title: "Summer Sale", validFrom: FUTURE, validTill: FAR_FUTURE },
      makeContext(),
    );

    expect(d.id).toBeDefined();
    expect(d.title).toBe("Summer Sale");
    expect(d.isActive).toBe(true);
  });
});

describe("OffersService.createDiscounts (batch)", () => {
  it("batch-inserts multiple discounts", async () => {
    const results = await service.createDiscounts(
      [
        { title: "Sale A", validFrom: FUTURE, validTill: FAR_FUTURE },
        { title: "Sale B", validFrom: FUTURE, validTill: FAR_FUTURE },
        { title: "Sale C", validFrom: FUTURE, validTill: FAR_FUTURE },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title).sort()).toEqual(["Sale A", "Sale B", "Sale C"]);

    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM discounts").first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createDiscounts([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("OffersService.findAllDiscounts", () => {
  it("returns all discounts", async () => {
    await service.createDiscount({ title: "A", validFrom: FUTURE, validTill: FAR_FUTURE }, makeContext());
    await service.createDiscount({ title: "B", validFrom: FUTURE, validTill: FAR_FUTURE }, makeContext());

    const result = await service.findAllDiscounts({}, makeContext());
    expect(result).toHaveLength(2);
  });
});

describe("OffersService.updateDiscount", () => {
  it("updates discount title", async () => {
    const d = await service.createDiscount(
      { title: "Old Sale", validFrom: FUTURE, validTill: FAR_FUTURE },
      makeContext(),
    );
    const updated = await service.updateDiscount(d.id, { title: "New Sale" }, makeContext());

    expect(updated.title).toBe("New Sale");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when discount does not exist", async () => {
    await expect(
      service.updateDiscount("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("Discount not found");
  });
});

describe("OffersService.deleteDiscount", () => {
  it("deletes a discount", async () => {
    const d = await service.createDiscount(
      { title: "Delete Me", validFrom: FUTURE, validTill: FAR_FUTURE },
      makeContext(),
    );
    const result = await service.deleteDiscount(d.id, makeContext());

    expect(result.message).toBe("Discount deleted");

    const row = await env.DB.prepare("SELECT id FROM discounts WHERE id = ?").bind(d.id).first();
    expect(row).toBeNull();
  });
});

// --- Coupons ---

describe("OffersService.createCoupon", () => {
  it("creates a coupon", async () => {
    const coupon = await service.createCoupon(
      { code: "SAVE10", discount: 10, validFrom: FUTURE, validTill: FAR_FUTURE },
      makeContext(),
    );

    expect(coupon.id).toBeDefined();
    expect(coupon.code).toBe("SAVE10");
    expect(coupon.discount).toBe(10);
  });
});

describe("OffersService.createCoupons (batch)", () => {
  it("batch-inserts multiple coupons", async () => {
    const results = await service.createCoupons(
      [
        { code: "CODE1", validFrom: FUTURE, validTill: FAR_FUTURE },
        { code: "CODE2", validFrom: FUTURE, validTill: FAR_FUTURE },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.code).sort()).toEqual(["CODE1", "CODE2"]);

    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM coupons").first<{ count: number }>();
    expect(count?.count).toBe(2);
  });
});

describe("OffersService.findAllCoupons", () => {
  it("returns all coupons", async () => {
    await service.createCoupon({ code: "A", validFrom: FUTURE, validTill: FAR_FUTURE }, makeContext());
    await service.createCoupon({ code: "B", validFrom: FUTURE, validTill: FAR_FUTURE }, makeContext());

    const result = await service.findAllCoupons({}, makeContext());
    expect(result).toHaveLength(2);
  });
});

describe("OffersService.updateCoupon", () => {
  it("updates coupon discount", async () => {
    const coupon = await service.createCoupon(
      { code: "SAVE5", discount: 5, validFrom: FUTURE, validTill: FAR_FUTURE },
      makeContext(),
    );
    const updated = await service.updateCoupon(coupon.id, { discount: 20 }, makeContext());

    expect(updated.discount).toBe(20);
  });

  it("throws when coupon does not exist", async () => {
    await expect(
      service.updateCoupon("nonexistent-id", { discount: 10 }, makeContext()),
    ).rejects.toThrow("Coupon not found");
  });
});

describe("OffersService.deleteCoupon", () => {
  it("deletes a coupon", async () => {
    const coupon = await service.createCoupon(
      { code: "GONE", validFrom: FUTURE, validTill: FAR_FUTURE },
      makeContext(),
    );
    const result = await service.deleteCoupon(coupon.id, makeContext());

    expect(result.message).toBe("Coupon deleted");

    const row = await env.DB.prepare("SELECT id FROM coupons WHERE id = ?").bind(coupon.id).first();
    expect(row).toBeNull();
  });
});

describe("OffersService.validateCoupon", () => {
  it("returns coupon and discount amount for FIXED_AMOUNT coupon", async () => {
    await service.createCoupon(
      { code: "FIXED50", discountType: "FIXED_AMOUNT", discount: 50, validFrom: PAST, validTill: FAR_FUTURE, isActive: true },
      makeContext(),
    );

    const result = await service.validateCoupon("FIXED50", undefined, 500, makeContext());

    expect(result.coupon.code).toBe("FIXED50");
    expect(result.discountAmount).toBe(50);
  });

  it("throws when coupon code does not exist", async () => {
    await expect(
      service.validateCoupon("NONEXIST", undefined, 100, makeContext()),
    ).rejects.toThrow("Coupon not found");
  });

  it("throws when coupon is expired", async () => {
    await service.createCoupon(
      { code: "EXPIRED", discount: 10, validFrom: PAST, validTill: PAST, isActive: true },
      makeContext(),
    );
    await expect(
      service.validateCoupon("EXPIRED", undefined, 100, makeContext()),
    ).rejects.toThrow("Coupon has expired");
  });

  it("throws when order total is below minimum", async () => {
    await service.createCoupon(
      { code: "MINAMT", discount: 10, minOrderAmount: 200, validFrom: PAST, validTill: FAR_FUTURE, isActive: true },
      makeContext(),
    );
    await expect(
      service.validateCoupon("MINAMT", undefined, 100, makeContext()),
    ).rejects.toThrow("Minimum order amount is 200");
  });
});
