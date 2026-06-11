import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { PaymentsService } from "./payments.service";

const service = new PaymentsService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM payment_logs").run();
  await env.DB.prepare("DELETE FROM payment_methods").run();
});

describe("PaymentsService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

// --- Payment Methods ---

describe("PaymentsService.createMethod", () => {
  it("creates a payment method", async () => {
    const pm = await service.createMethod({ title: "Cash on Delivery" }, makeContext());

    expect(pm.id).toBeDefined();
    expect(pm.title).toBe("Cash on Delivery");
    expect(pm.isActive).toBe(true);

    const row = await env.DB.prepare("SELECT title, is_active FROM payment_methods WHERE id = ?")
      .bind(pm.id)
      .first<{ title: string; is_active: number }>();

    expect(row?.title).toBe("Cash on Delivery");
    expect(row?.is_active).toBe(1);
  });
});

describe("PaymentsService.createMethods (batch)", () => {
  it("batch-inserts multiple payment methods", async () => {
    const results = await service.createMethods(
      [
        { title: "Cash on Delivery" },
        { title: "SSL Commerz" },
        { title: "bKash" },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.title).sort()).toEqual(["Cash on Delivery", "SSL Commerz", "bKash"].sort());

    const count = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM payment_methods",
    ).first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createMethods([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("PaymentsService.findAllMethods", () => {
  it("returns empty when no methods exist", async () => {
    const result = await service.findAllMethods({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all payment methods", async () => {
    await service.createMethods(
      [{ title: "Cash" }, { title: "Card" }],
      makeContext(),
    );
    const result = await service.findAllMethods({}, makeContext());
    expect(result).toHaveLength(2);
  });
});

describe("PaymentsService.updateMethod", () => {
  it("updates payment method title", async () => {
    const pm = await service.createMethod({ title: "Cash" }, makeContext());
    const updated = await service.updateMethod(pm.id, { title: "Cash on Delivery" }, makeContext());

    expect(updated.id).toBe(pm.id);
    expect(updated.title).toBe("Cash on Delivery");
    expect(updated.updatedAt).toBeDefined();
  });

  it("throws when payment method does not exist", async () => {
    await expect(
      service.updateMethod("nonexistent-id", { title: "X" }, makeContext()),
    ).rejects.toThrow("Payment method not found");
  });
});

describe("PaymentsService.deleteMethod", () => {
  it("deletes a payment method", async () => {
    const pm = await service.createMethod({ title: "Delete Me" }, makeContext());
    const result = await service.deleteMethod(pm.id, makeContext());

    expect(result.message).toBe("Payment method deleted");

    const row = await env.DB.prepare("SELECT id FROM payment_methods WHERE id = ?")
      .bind(pm.id)
      .first();
    expect(row).toBeNull();
  });
});

// --- Payment Logs ---

describe("PaymentsService.createLog", () => {
  it("creates a payment log", async () => {
    const log = await service.createLog(
      { transactionId: "TXN-001", paymentStatus: "PENDING", amount: 500 },
      makeContext(),
    );

    expect(log.id).toBeDefined();
    expect(log.transactionId).toBe("TXN-001");
    expect(log.paymentStatus).toBe("PENDING");
    expect(log.amount).toBe(500);
  });
});

describe("PaymentsService.createLogs (batch)", () => {
  it("batch-inserts multiple payment logs", async () => {
    const results = await service.createLogs(
      [
        { transactionId: "TXN-A", paymentStatus: "PENDING", amount: 100 },
        { transactionId: "TXN-B", paymentStatus: "PAID", amount: 200 },
        { transactionId: "TXN-C", paymentStatus: "FAILED", amount: 300 },
      ],
      makeContext(),
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.transactionId).sort()).toEqual(["TXN-A", "TXN-B", "TXN-C"]);

    const count = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM payment_logs",
    ).first<{ count: number }>();
    expect(count?.count).toBe(3);
  });

  it("returns empty array for empty payloads", async () => {
    const results = await service.createLogs([], makeContext());
    expect(results).toEqual([]);
  });
});

describe("PaymentsService.findAllLogs", () => {
  it("returns empty when no logs exist", async () => {
    const result = await service.findAllLogs({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all payment logs", async () => {
    await service.createLogs(
      [
        { transactionId: "TXN-1", paymentStatus: "PAID", amount: 100 },
        { transactionId: "TXN-2", paymentStatus: "PENDING", amount: 200 },
      ],
      makeContext(),
    );

    const result = await service.findAllLogs({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters logs by orderId", async () => {
    await service.createLog({ transactionId: "TXN-X", paymentStatus: "PAID", orderId: "order-1" }, makeContext());
    await service.createLog({ transactionId: "TXN-Y", paymentStatus: "PAID", orderId: "order-2" }, makeContext());

    const result = await service.findAllLogs({ orderId: "order-1" }, makeContext());
    expect(result).toHaveLength(1);
    expect(result[0]?.transactionId).toBe("TXN-X");
  });
});
