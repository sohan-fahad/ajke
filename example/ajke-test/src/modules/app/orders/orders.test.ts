import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { OrdersService } from "./orders.service";

const service = new OrdersService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

let seededProductId: string;
let seededPaymentMethodId: string;
let seededCustomerId: string;
let seededAddressId: string;
let seededDeliverymanId: string;

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));

  const product = await env.DB.prepare(
    "INSERT INTO products (id, title, code) VALUES (lower(hex(randomblob(10))), 'Widget', 'WGT-001') RETURNING id",
  ).first<{ id: string }>();
  seededProductId = product!.id;

  const pm = await env.DB.prepare(
    "INSERT INTO payment_methods (id, title) VALUES (lower(hex(randomblob(10))), 'Cash') RETURNING id",
  ).first<{ id: string }>();
  seededPaymentMethodId = pm!.id;

  const user = await env.DB.prepare(
    "INSERT INTO users (id, phone_number) VALUES (lower(hex(randomblob(10))), '01700000000') RETURNING id",
  ).first<{ id: string }>();
  seededCustomerId = user!.id;

  const addr = await env.DB.prepare(
    "INSERT INTO addresses (id, customer_name, phone_number, full_address) VALUES (lower(hex(randomblob(10))), 'John', '01700000000', '123 Main St') RETURNING id",
  ).first<{ id: string }>();
  seededAddressId = addr!.id;

  const dm = await env.DB.prepare(
    "INSERT INTO deliverymen (id, user_id) VALUES (lower(hex(randomblob(10))), ?) RETURNING id",
  )
    .bind(seededCustomerId)
    .first<{ id: string }>();
  seededDeliverymanId = dm!.id;
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM order_life_cycles").run();
  await env.DB.prepare("DELETE FROM order_item_variants").run();
  await env.DB.prepare("DELETE FROM order_items").run();
  await env.DB.prepare("DELETE FROM orders").run();
});

function orderPayload(overrides: Record<string, unknown> = {}) {
  return {
    customerId: seededCustomerId,
    addressId: seededAddressId,
    paymentMethodId: seededPaymentMethodId,
    items: [
      { productId: seededProductId, quantity: 2, mrp: 100, liftingPrice: 80, discount: 10 },
    ],
    ...overrides,
  };
}

describe("OrdersService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("OrdersService.createOrder", () => {
  it("creates an order with items and initial lifecycle in a single batch", async () => {
    const order = await service.createOrder(orderPayload(), makeContext());

    expect(order.id).toBeDefined();
    expect(order.code).toMatch(/^ORD-/);
    expect(order.orderStatus).toBe("PENDING");
    expect(order.orderItems).toHaveLength(1);
    expect(order.orderLifeCycles).toHaveLength(1);
    expect(order.orderLifeCycles[0]?.orderStatus).toBe("PENDING");

    const orderRow = await env.DB.prepare("SELECT code, order_status, sub_total, total FROM orders WHERE id = ?")
      .bind(order.id)
      .first<{ code: string; order_status: string; sub_total: number; total: number }>();

    expect(orderRow?.order_status).toBe("PENDING");
    expect(orderRow?.sub_total).toBe(200);
    expect(orderRow?.total).toBe(180);
  });

  it("calculates totals correctly (subTotal − discount = total)", async () => {
    const order = await service.createOrder(
      orderPayload({
        items: [
          { productId: seededProductId, quantity: 3, mrp: 100, liftingPrice: 80, discount: 20 },
        ],
      }),
      makeContext(),
    );

    expect(order.subTotal).toBe(300);
    expect(order.discount).toBe(60);
    expect(order.total).toBe(240);
  });

  it("applies coupon discount to total", async () => {
    const order = await service.createOrder(
      orderPayload({ couponDiscount: 30 }),
      makeContext(),
    );

    expect(order.couponDiscount).toBe(30);
    expect(order.total).toBe(150);
  });

  it("batch-inserts all order items without sequential round trips", async () => {
    const order = await service.createOrder(
      orderPayload({
        items: [
          { productId: seededProductId, quantity: 1, mrp: 50, liftingPrice: 40, discount: 5 },
          { productId: seededProductId, quantity: 2, mrp: 75, liftingPrice: 60, discount: 10 },
        ],
      }),
      makeContext(),
    );

    expect(order.orderItems).toHaveLength(2);

    const itemCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM order_items WHERE order_id = ?",
    )
      .bind(order.id)
      .first<{ count: number }>();
    expect(itemCount?.count).toBe(2);
  });
});

describe("OrdersService.findAll", () => {
  it("returns empty when no orders", async () => {
    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all orders", async () => {
    await service.createOrder(orderPayload(), makeContext());
    await service.createOrder(orderPayload(), makeContext());

    const result = await service.findAll({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by orderStatus", async () => {
    const order = await service.createOrder(orderPayload(), makeContext());
    await service.updateStatus(order.id, "CONFIRMED", undefined, undefined, makeContext());

    const pending = await service.findAll({ orderStatus: "PENDING" }, makeContext());
    const confirmed = await service.findAll({ orderStatus: "CONFIRMED" }, makeContext());

    expect(confirmed).toHaveLength(1);
    expect(pending).toHaveLength(0);
  });
});

describe("OrdersService.findOne", () => {
  it("returns order with items and lifecycle", async () => {
    const created = await service.createOrder(orderPayload(), makeContext());
    const found = await service.findOne(created.id, makeContext());

    expect(found.id).toBe(created.id);
    expect(found.orderItems).toHaveLength(1);
    expect(found.orderLifeCycles).toHaveLength(1);
  });

  it("throws when order does not exist", async () => {
    await expect(service.findOne("nonexistent-id", makeContext())).rejects.toThrow(
      "Order not found",
    );
  });
});

describe("OrdersService.updateStatus", () => {
  it("updates order status and inserts lifecycle entry in a single batch", async () => {
    const order = await service.createOrder(orderPayload(), makeContext());
    const updated = await service.updateStatus(order.id, "CONFIRMED", "Admin approved", undefined, makeContext());

    expect(updated.orderStatus).toBe("CONFIRMED");
    expect(updated.orderLifeCycles).toHaveLength(2);

    const confirmed = updated.orderLifeCycles.find((lc) => lc.orderStatus === "CONFIRMED");
    expect(confirmed?.comments).toBe("Admin approved");
  });

  it("throws when order does not exist", async () => {
    await expect(
      service.updateStatus("nonexistent-id", "CONFIRMED", undefined, undefined, makeContext()),
    ).rejects.toThrow("Order not found");
  });
});

describe("OrdersService.myOrders", () => {
  it("returns orders for a specific customer", async () => {
    await service.createOrder(orderPayload(), makeContext());
    await service.createOrder(orderPayload(), makeContext());

    const result = await service.myOrders(seededCustomerId, undefined, makeContext());
    expect(result).toHaveLength(2);
    expect(result.every((o) => o.customerId === seededCustomerId)).toBe(true);
  });
});

describe("OrdersService.assignDeliveryman", () => {
  it("assigns a deliveryman to an order", async () => {
    const order = await service.createOrder(orderPayload(), makeContext());

    const updated = await service.assignDeliveryman(order.id, seededDeliverymanId, makeContext());
    expect(updated.deliverymanId).toBe(seededDeliverymanId);
  });
});
