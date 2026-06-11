import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { LocationsService } from "./locations.service";

const service = new LocationsService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM addresses").run();
  await env.DB.prepare("DELETE FROM areas").run();
  await env.DB.prepare("DELETE FROM zones").run();
  await env.DB.prepare("DELETE FROM cities").run();
  await env.DB.prepare("DELETE FROM warehouses").run();
});

describe("LocationsService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

// --- Cities ---

describe("LocationsService.createCity", () => {
  it("creates a city", async () => {
    const city = await service.createCity({ title: "Dhaka" }, makeContext());

    expect(city.id).toBeDefined();
    expect(city.title).toBe("Dhaka");

    const row = await env.DB.prepare("SELECT title FROM cities WHERE id = ?")
      .bind(city.id)
      .first<{ title: string }>();
    expect(row?.title).toBe("Dhaka");
  });
});

describe("LocationsService.createCities (batch)", () => {
  it("batch-inserts multiple cities", async () => {
    const results = await service.createCities(
      [{ title: "Dhaka" }, { title: "Chittagong" }, { title: "Sylhet" }],
      makeContext(),
    );

    expect(results).toHaveLength(3);
    expect(results.map((c) => c.title).sort()).toEqual(["Chittagong", "Dhaka", "Sylhet"]);

    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM cities").first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createCities([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("LocationsService.findAllCities", () => {
  it("returns all cities", async () => {
    await service.createCities([{ title: "Dhaka" }, { title: "Chittagong" }], makeContext());
    const result = await service.findAllCities({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("returns empty when no cities", async () => {
    const result = await service.findAllCities({}, makeContext());
    expect(result).toHaveLength(0);
  });
});

describe("LocationsService.updateCity", () => {
  it("updates city title", async () => {
    const city = await service.createCity({ title: "Dhaka" }, makeContext());
    const updated = await service.updateCity(city.id, { title: "Dhaka Metro" }, makeContext());

    expect(updated.title).toBe("Dhaka Metro");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when city does not exist", async () => {
    await expect(
      service.updateCity("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("City not found");
  });
});

describe("LocationsService.deleteCity", () => {
  it("deletes a city", async () => {
    const city = await service.createCity({ title: "Dhaka" }, makeContext());
    const result = await service.deleteCity(city.id, makeContext());

    expect(result.message).toBe("City deleted");

    const row = await env.DB.prepare("SELECT id FROM cities WHERE id = ?")
      .bind(city.id)
      .first();
    expect(row).toBeNull();
  });
});

// --- Zones ---

describe("LocationsService.createZone", () => {
  it("creates a zone", async () => {
    const zone = await service.createZone({ name: "zone-north", title: "North Zone" }, makeContext());

    expect(zone.id).toBeDefined();
    expect(zone.name).toBe("zone-north");
  });
});

describe("LocationsService.createZones (batch)", () => {
  it("batch-inserts multiple zones", async () => {
    const results = await service.createZones(
      [
        { name: "zone-a", title: "Zone A" },
        { name: "zone-b", title: "Zone B" },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(2);
    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM zones").first<{ count: number }>();
    expect(count?.count).toBe(2);
  });
});

describe("LocationsService.updateZone", () => {
  it("updates zone title", async () => {
    const zone = await service.createZone({ name: "zone-x", title: "Zone X" }, makeContext());
    const updated = await service.updateZone(zone.id, { title: "Zone X Updated" }, makeContext());

    expect(updated.title).toBe("Zone X Updated");
  });

  it("throws when zone does not exist", async () => {
    await expect(
      service.updateZone("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("Zone not found");
  });
});

// --- Areas ---

describe("LocationsService.createArea", () => {
  it("creates an area", async () => {
    const area = await service.createArea({ title: "Gulshan" }, makeContext());

    expect(area.id).toBeDefined();
    expect(area.title).toBe("Gulshan");
  });
});

describe("LocationsService.createAreas (batch)", () => {
  it("batch-inserts multiple areas", async () => {
    const results = await service.createAreas(
      [{ title: "Gulshan" }, { title: "Dhanmondi" }, { title: "Mirpur" }],
      makeContext(),
    );

    expect(results).toHaveLength(3);
    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM areas").first<{ count: number }>();
    expect(count?.count).toBe(3);
  });
});

describe("LocationsService.updateArea", () => {
  it("updates area title", async () => {
    const area = await service.createArea({ title: "Gulshan" }, makeContext());
    const updated = await service.updateArea(area.id, { title: "Gulshan-2" }, makeContext());

    expect(updated.title).toBe("Gulshan-2");
  });

  it("throws when area does not exist", async () => {
    await expect(
      service.updateArea("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("Area not found");
  });
});

describe("LocationsService.deleteArea", () => {
  it("deletes an area", async () => {
    const area = await service.createArea({ title: "Gulshan" }, makeContext());
    const result = await service.deleteArea(area.id, makeContext());

    expect(result.message).toBe("Area deleted");

    const row = await env.DB.prepare("SELECT id FROM areas WHERE id = ?").bind(area.id).first();
    expect(row).toBeNull();
  });
});

// --- Addresses ---

describe("LocationsService.createAddress", () => {
  it("creates an address", async () => {
    const addr = await service.createAddress(
      { customerName: "John Doe", phoneNumber: "01700000000", fullAddress: "123 Main St" },
      makeContext(),
    );

    expect(addr.id).toBeDefined();
    expect(addr.customerName).toBe("John Doe");
    expect(addr.fullAddress).toBe("123 Main St");
  });
});

describe("LocationsService.createAddresses (batch)", () => {
  it("batch-inserts multiple addresses", async () => {
    const results = await service.createAddresses(
      [
        { customerName: "Alice", phoneNumber: "01700000001", fullAddress: "1 Elm St" },
        { customerName: "Bob", phoneNumber: "01700000002", fullAddress: "2 Oak Ave" },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(2);
    const count = await env.DB.prepare("SELECT COUNT(*) as count FROM addresses").first<{ count: number }>();
    expect(count?.count).toBe(2);
  });
});

describe("LocationsService.updateAddress", () => {
  it("updates address fullAddress", async () => {
    const addr = await service.createAddress(
      { customerName: "Alice", phoneNumber: "01700000001", fullAddress: "Old Address" },
      makeContext(),
    );
    const updated = await service.updateAddress(addr.id, { fullAddress: "New Address" }, makeContext());

    expect(updated.fullAddress).toBe("New Address");
  });

  it("throws when address does not exist", async () => {
    await expect(
      service.updateAddress("nonexistent-id", { fullAddress: "X" }, makeContext()),
    ).rejects.toThrow("Address not found");
  });
});

describe("LocationsService.deleteAddress", () => {
  it("deletes an address", async () => {
    const addr = await service.createAddress(
      { customerName: "Alice", phoneNumber: "01700000001", fullAddress: "Test St" },
      makeContext(),
    );
    const result = await service.deleteAddress(addr.id, makeContext());

    expect(result.message).toBe("Address deleted");

    const row = await env.DB.prepare("SELECT id FROM addresses WHERE id = ?").bind(addr.id).first();
    expect(row).toBeNull();
  });
});
