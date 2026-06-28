import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { DeliveryManService } from "./deliveryman.service";

const service = new DeliveryManService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM deliverymen").run();
  await env.DB.prepare("DELETE FROM user_roles").run();
  await env.DB.prepare("DELETE FROM users").run();
  await env.DB.prepare("DELETE FROM roles").run();
});

describe("DeliveryManService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("DeliveryManService.register", () => {
  it("creates user + deliveryman in a single batch and returns the deliveryman", async () => {
    const dm = await service.register(
      {
        phoneNumber: "01700000001",
        password: "secret123",
        firstName: "Karim",
        lastName: "Ahmed",
        licenseNumber: "LIC-001",
        vehicleNumber: "VEH-001",
      },
      makeContext(),
    );

    expect(dm.id).toBeDefined();
    expect(dm.licenseNumber).toBe("LIC-001");
    expect(dm.vehicleNumber).toBe("VEH-001");
    expect(dm.status).toBe("INACTIVE");
    expect(dm.dutyStatus).toBe("OFFLINE");

    const userRow = await env.DB.prepare(
      "SELECT phone_number, full_name, password FROM users WHERE id = ?",
    )
      .bind(dm.userId)
      .first<{ phone_number: string; full_name: string; password: string }>();

    expect(userRow?.phone_number).toBe("01700000001");
    expect(userRow?.full_name).toBe("Karim Ahmed");
    expect(userRow?.password).not.toBe("secret123");
  });

  it("assigns the Delivery Man role when the role exists", async () => {
    await env.DB.prepare(
      "INSERT INTO roles (id, title) VALUES (lower(hex(randomblob(10))), 'Delivery Man')",
    ).run();

    const dm = await service.register(
      { phoneNumber: "01700000002", password: "pass456", firstName: "Rahim" },
      makeContext(),
    );

    const roleRow = await env.DB.prepare(
      "SELECT role_id FROM user_roles WHERE user_id = ?",
    )
      .bind(dm.userId)
      .first<{ role_id: string }>();

    expect(roleRow?.role_id).toBeDefined();
  });

  it("registers without assigning a role when Delivery Man role does not exist", async () => {
    const dm = await service.register(
      { phoneNumber: "01700000003", password: "pass789" },
      makeContext(),
    );

    expect(dm.id).toBeDefined();

    const roleRows = await env.DB.prepare(
      "SELECT id FROM user_roles WHERE user_id = ?",
    )
      .bind(dm.userId)
      .all();

    expect(roleRows.results).toHaveLength(0);
  });
});

describe("DeliveryManService.findAll", () => {
  it("returns empty when no deliverymen", async () => {
    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all deliverymen", async () => {
    await service.register({ phoneNumber: "01711111111", password: "pass" }, makeContext());
    await service.register({ phoneNumber: "01722222222", password: "pass" }, makeContext());

    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by status", async () => {
    const dm = await service.register({ phoneNumber: "01733333333", password: "pass" }, makeContext());
    await service.updateStatus(dm.id, "ACTIVE", makeContext());

    const active = await service.findAll({ status: "ACTIVE" }, makeContext());
    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe(dm.id);
  });
});

describe("DeliveryManService.findOne", () => {
  it("returns deliveryman by id", async () => {
    const dm = await service.register({ phoneNumber: "01744444444", password: "pass" }, makeContext());
    const found = await service.findOne(dm.id, makeContext());

    expect(found.id).toBe(dm.id);
  });

  it("throws when deliveryman does not exist", async () => {
    await expect(service.findOne("nonexistent-id", makeContext())).rejects.toThrow(
      "Delivery man not found",
    );
  });
});

describe("DeliveryManService.updateStatus", () => {
  it("updates status to ACTIVE", async () => {
    const dm = await service.register({ phoneNumber: "01755555555", password: "pass" }, makeContext());
    const updated = await service.updateStatus(dm.id, "ACTIVE", makeContext());

    expect(updated.status).toBe("ACTIVE");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when deliveryman does not exist", async () => {
    await expect(
      service.updateStatus("nonexistent-id", "ACTIVE", makeContext()),
    ).rejects.toThrow("Delivery man not found");
  });
});

describe("DeliveryManService.updateDutyStatus", () => {
  it("updates dutyStatus to ONLINE", async () => {
    const dm = await service.register({ phoneNumber: "01766666666", password: "pass" }, makeContext());
    const updated = await service.updateDutyStatus(dm.id, "ONLINE", makeContext());

    expect(updated.dutyStatus).toBe("ONLINE");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when deliveryman does not exist", async () => {
    await expect(
      service.updateDutyStatus("nonexistent-id", "ONLINE", makeContext()),
    ).rejects.toThrow("Delivery man not found");
  });
});

describe("DeliveryManService.update", () => {
  it("updates deliveryman fields", async () => {
    const dm = await service.register(
      { phoneNumber: "01777777777", password: "pass", licenseNumber: "OLD-LIC" },
      makeContext(),
    );
    const updated = await service.update(dm.id, { licenseNumber: "NEW-LIC" }, makeContext());

    expect(updated.licenseNumber).toBe("NEW-LIC");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when deliveryman does not exist", async () => {
    await expect(
      service.update("nonexistent-id", { licenseNumber: "X" }, makeContext()),
    ).rejects.toThrow("Delivery man not found");
  });
});
