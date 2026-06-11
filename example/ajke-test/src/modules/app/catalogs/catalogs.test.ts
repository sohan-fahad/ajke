import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { CatalogsService } from "./catalogs.service";

const service = new CatalogsService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM sub_categories").run();
  await env.DB.prepare("DELETE FROM categories").run();
  await env.DB.prepare("DELETE FROM departments").run();
  await env.DB.prepare("DELETE FROM brands").run();
  await env.DB.prepare("DELETE FROM special_categories").run();
});

// ─── Service instantiation ──────────────────────────────────────────────────

describe("CatalogsService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

// ─── Departments ────────────────────────────────────────────────────────────

describe("CatalogsService.createDepartment", () => {
  it("creates a department and auto-generates slug", async () => {
    const created = await service.createDepartment({ title: "Fresh Produce" }, makeContext());
    console.log("[createDepartment] result:", created);

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Fresh Produce");
    expect(created.slug).toBe("fresh-produce");

    const row = await env.DB.prepare("SELECT title, slug FROM departments WHERE id = ?")
      .bind(created.id)
      .first<{ title: string; slug: string }>();
    console.log("[createDepartment] DB row:", row);
    expect(row?.title).toBe("Fresh Produce");
    expect(row?.slug).toBe("fresh-produce");
  });
});

describe("CatalogsService.bulkCreateDepartments", () => {
  it("inserts multiple departments in a single statement", async () => {
    const results = await service.bulkCreateDepartments(
      [{ title: "Dairy" }, { title: "Bakery" }, { title: "Frozen Foods" }],
      makeContext(),
    );
    console.log("[bulkCreateDepartments] results:", results);

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title)).toEqual(expect.arrayContaining(["Dairy", "Bakery", "Frozen Foods"]));
    expect(results.map((r) => r.slug)).toEqual(expect.arrayContaining(["dairy", "bakery", "frozen-foods"]));
    results.forEach((r) => expect(r.id).toBeDefined());
  });
});

describe("CatalogsService.updateDepartment", () => {
  it("updates an existing department", async () => {
    const created = await service.createDepartment({ title: "Meat" }, makeContext());
    const updated = await service.updateDepartment(created.id, { title: "Meat & Poultry" }, makeContext());
    console.log("[updateDepartment] result:", updated);

    expect(updated.title).toBe("Meat & Poultry");
    expect(updated.updatedAt).not.toBeNull();
  });

  it("throws when department does not exist", async () => {
    await expect(
      service.updateDepartment("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("Department not found");
  });
});

describe("CatalogsService.bulkUpdateDepartments", () => {
  it("batch-updates multiple departments in one round trip", async () => {
    const [a, b] = await service.bulkCreateDepartments(
      [{ title: "Snacks" }, { title: "Beverages" }],
      makeContext(),
    );
    console.log("[bulkUpdateDepartments] created:", a, b);

    const results = await service.bulkUpdateDepartments(
      [
        { id: a!.id, title: "Snacks & Nuts" },
        { id: b!.id, title: "Drinks" },
      ],
      makeContext(),
    );
    console.log("[bulkUpdateDepartments] updated:", results);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.title)).toEqual(expect.arrayContaining(["Snacks & Nuts", "Drinks"]));
    results.forEach((r) => expect(r.updatedAt).not.toBeNull());
  });
});

describe("CatalogsService.deleteDepartment", () => {
  it("deletes a department", async () => {
    const created = await service.createDepartment({ title: "Temp Dept" }, makeContext());
    const result = await service.deleteDepartment(created.id, makeContext());
    expect(result.message).toBe("Department deleted");

    const row = await env.DB.prepare("SELECT id FROM departments WHERE id = ?").bind(created.id).first();
    expect(row).toBeNull();
  });
});

// ─── Brands ─────────────────────────────────────────────────────────────────

describe("CatalogsService.createBrand", () => {
  it("creates a brand and auto-generates slug", async () => {
    const created = await service.createBrand({ title: "Brand X" }, makeContext());
    console.log("[createBrand] result:", created);

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Brand X");
    expect(created.slug).toBe("brand-x");

    const row = await env.DB.prepare("SELECT title, slug FROM brands WHERE id = ?")
      .bind(created.id)
      .first<{ title: string; slug: string }>();
    expect(row?.slug).toBe("brand-x");
  });
});

describe("CatalogsService.bulkCreateBrands", () => {
  it("inserts multiple brands in a single statement", async () => {
    const results = await service.bulkCreateBrands(
      [{ title: "Nike" }, { title: "Adidas" }],
      makeContext(),
    );
    console.log("[bulkCreateBrands] results:", results);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.slug)).toEqual(expect.arrayContaining(["nike", "adidas"]));
  });
});

describe("CatalogsService.bulkUpdateBrands", () => {
  it("batch-updates multiple brands", async () => {
    const [a, b] = await service.bulkCreateBrands(
      [{ title: "Alpha" }, { title: "Beta" }],
      makeContext(),
    );

    const results = await service.bulkUpdateBrands(
      [
        { id: a!.id, title: "Alpha Pro" },
        { id: b!.id, title: "Beta Plus" },
      ],
      makeContext(),
    );
    console.log("[bulkUpdateBrands] results:", results);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.title)).toEqual(expect.arrayContaining(["Alpha Pro", "Beta Plus"]));
  });
});

describe("CatalogsService.deleteBrand", () => {
  it("deletes a brand", async () => {
    const created = await service.createBrand({ title: "Temp Brand" }, makeContext());
    const result = await service.deleteBrand(created.id, makeContext());
    expect(result.message).toBe("Brand deleted");

    const row = await env.DB.prepare("SELECT id FROM brands WHERE id = ?").bind(created.id).first();
    expect(row).toBeNull();
  });
});

// ─── Special Categories ──────────────────────────────────────────────────────

describe("CatalogsService.createSpecialCategory", () => {
  it("creates a special category and auto-generates slug", async () => {
    const created = await service.createSpecialCategory({ title: "Flash Sale", orderPriority: 1 }, makeContext());
    console.log("[createSpecialCategory] result:", created);

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Flash Sale");
    expect(created.slug).toBe("flash-sale");
    expect(created.orderPriority).toBe(1);
  });
});

describe("CatalogsService.bulkCreateSpecialCategories", () => {
  it("inserts multiple special categories in a single statement", async () => {
    const results = await service.bulkCreateSpecialCategories(
      [
        { title: "Hot Deals", orderPriority: 3 },
        { title: "New Arrivals", orderPriority: 1 },
        { title: "Clearance", orderPriority: 2 },
      ],
      makeContext(),
    );
    console.log("[bulkCreateSpecialCategories] results:", results);

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title)).toEqual(
      expect.arrayContaining(["Hot Deals", "New Arrivals", "Clearance"]),
    );
  });
});

describe("CatalogsService.reorderSpecialCategories", () => {
  it("batch-updates order priorities and reflects new order in findAll", async () => {
    const [a, b, c] = await service.bulkCreateSpecialCategories(
      [
        { title: "Hot Deals", orderPriority: 3 },
        { title: "New Arrivals", orderPriority: 1 },
        { title: "Clearance", orderPriority: 2 },
      ],
      makeContext(),
    );
    console.log("[reorderSpecialCategories] created:", a, b, c);

    const result = await service.reorderSpecialCategories(
      [
        { id: a!.id, orderPriority: 1 },
        { id: b!.id, orderPriority: 2 },
        { id: c!.id, orderPriority: 3 },
      ],
      makeContext(),
    );
    expect(result.message).toBe("Reordered");

    const all = await service.findAllSpecialCategories({}, makeContext());
    console.log("[reorderSpecialCategories] reordered:", all.map((r) => ({ title: r.title, order: r.orderPriority })));
    expect(all[0]?.id).toBe(a!.id);
    expect(all[1]?.id).toBe(b!.id);
    expect(all[2]?.id).toBe(c!.id);
  });
});

describe("CatalogsService.deleteSpecialCategory", () => {
  it("deletes a special category", async () => {
    const created = await service.createSpecialCategory({ title: "Temp SC" }, makeContext());
    const result = await service.deleteSpecialCategory(created.id, makeContext());
    expect(result.message).toBe("Special category deleted");

    const row = await env.DB.prepare("SELECT id FROM special_categories WHERE id = ?")
      .bind(created.id)
      .first();
    expect(row).toBeNull();
  });
});

// ─── Categories ─────────────────────────────────────────────────────────────

describe("CatalogsService.createCategory", () => {
  it("creates a category under a department", async () => {
    const dept = await service.createDepartment({ title: "Grocery" }, makeContext());
    const cat = await service.createCategory({ title: "Organic", department: dept.id }, makeContext());
    console.log("[createCategory] result:", cat);

    expect(cat.id).toBeDefined();
    expect(cat.title).toBe("Organic");
    expect(cat.slug).toBe("organic");
    expect(cat.departmentId).toBe(dept.id);
  });
});

describe("CatalogsService.bulkCreateCategories", () => {
  it("inserts multiple categories in a single statement", async () => {
    const dept = await service.createDepartment({ title: "Electronics" }, makeContext());
    const results = await service.bulkCreateCategories(
      [
        { title: "Phones", department: dept.id },
        { title: "Laptops", department: dept.id },
      ],
      makeContext(),
    );
    console.log("[bulkCreateCategories] results:", results);

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.departmentId === dept.id)).toBe(true);
    expect(results.map((r) => r.slug)).toEqual(expect.arrayContaining(["phones", "laptops"]));
  });
});

describe("CatalogsService.bulkUpdateCategories", () => {
  it("batch-updates multiple categories", async () => {
    const dept = await service.createDepartment({ title: "Home" }, makeContext());
    const [a, b] = await service.bulkCreateCategories(
      [
        { title: "Kitchen", department: dept.id },
        { title: "Bedroom", department: dept.id },
      ],
      makeContext(),
    );

    const results = await service.bulkUpdateCategories(
      [
        { id: a!.id, title: "Kitchen & Dining" },
        { id: b!.id, title: "Bedroom & Bath" },
      ],
      makeContext(),
    );
    console.log("[bulkUpdateCategories] results:", results);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.title)).toEqual(
      expect.arrayContaining(["Kitchen & Dining", "Bedroom & Bath"]),
    );
  });
});

// ─── SubCategories ─────────────────────────────────────────────────────────

describe("CatalogsService.createSubCategory", () => {
  it("creates a sub-category under a category", async () => {
    const dept = await service.createDepartment({ title: "Food" }, makeContext());
    const cat = await service.createCategory({ title: "Vegetables", department: dept.id }, makeContext());
    const sc = await service.createSubCategory({ title: "Leafy Greens", category: cat.id }, makeContext());
    console.log("[createSubCategory] result:", sc);

    expect(sc.id).toBeDefined();
    expect(sc.title).toBe("Leafy Greens");
    expect(sc.slug).toBe("leafy-greens");
    expect(sc.categoryId).toBe(cat.id);
  });
});

describe("CatalogsService.bulkCreateSubCategories", () => {
  it("inserts multiple sub-categories in a single statement", async () => {
    const dept = await service.createDepartment({ title: "Apparel" }, makeContext());
    const cat = await service.createCategory({ title: "Men", department: dept.id }, makeContext());
    const results = await service.bulkCreateSubCategories(
      [
        { title: "T-Shirts", category: cat.id },
        { title: "Jeans", category: cat.id },
      ],
      makeContext(),
    );
    console.log("[bulkCreateSubCategories] results:", results);

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.categoryId === cat.id)).toBe(true);
    expect(results.map((r) => r.slug)).toEqual(expect.arrayContaining(["t-shirts", "jeans"]));
  });
});

describe("CatalogsService.bulkUpdateSubCategories", () => {
  it("batch-updates multiple sub-categories", async () => {
    const dept = await service.createDepartment({ title: "Sports" }, makeContext());
    const cat = await service.createCategory({ title: "Outdoor", department: dept.id }, makeContext());
    const [a, b] = await service.bulkCreateSubCategories(
      [
        { title: "Camping", category: cat.id },
        { title: "Hiking", category: cat.id },
      ],
      makeContext(),
    );

    const results = await service.bulkUpdateSubCategories(
      [
        { id: a!.id, title: "Camping Gear" },
        { id: b!.id, title: "Hiking & Trekking" },
      ],
      makeContext(),
    );
    console.log("[bulkUpdateSubCategories] results:", results);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.title)).toEqual(
      expect.arrayContaining(["Camping Gear", "Hiking & Trekking"]),
    );
  });
});
