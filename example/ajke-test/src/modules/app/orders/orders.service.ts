import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc, like } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { orders, orderItems, orderItemVariants, orderLifeCycles } from "./orders.entity";
import { ENUM_ORDER_STATUS } from "../../../shared";
import { ulid } from "ulid";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

function generateOrderCode(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

@Injectable()
export class OrdersService {
  async findAll(
    query: {
      organizationId?: string;
      orderStatus?: string;
      customerId?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    c: Context,
  ) {
    const db = getDb(c);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = db.select().from(orders).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(orders.organizationId, query.organizationId));
    if (query.orderStatus) conds.push(eq(orders.orderStatus, query.orderStatus));
    if (query.customerId) conds.push(eq(orders.customerId, query.customerId));
    if (query.search) conds.push(like(orders.code, `%${query.search}%`));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new NotFoundException("Order not found");

    const [items, lifeCycles] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, id)),
      db.select().from(orderLifeCycles).where(eq(orderLifeCycles.orderId, id)).orderBy(desc(orderLifeCycles.createdAt)),
    ]);

    return { ...order, orderItems: items, orderLifeCycles: lifeCycles };
  }

  async createOrder(
    payload: {
      customerId: string;
      addressId: string;
      paymentMethodId: string;
      couponId?: string;
      couponDiscount?: number;
      organizationId?: string;
      orderSource?: string;
      items: {
        productId: string;
        quantity: number;
        mrp: number;
        liftingPrice: number;
        discount: number;
        variants?: { variantId: string; variantOptionId: string }[];
      }[];
    },
    c: Context,
  ) {
    const db = getDb(c);

    const subTotal = payload.items.reduce((s, i) => s + i.mrp * i.quantity, 0);
    const discount = payload.items.reduce((s, i) => s + i.discount * i.quantity, 0);
    const couponDiscount = payload.couponDiscount || 0;
    const total = subTotal - discount - couponDiscount;
    const orderId = ulid();

    const itemIds = payload.items.map(() => ulid());
    const itemRows = payload.items.map((item, i) => ({
      id: itemIds[i],
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      mrp: item.mrp,
      liftingPrice: item.liftingPrice,
      discount: item.discount,
      organizationId: payload.organizationId,
    }));

    const variantRows = payload.items.flatMap((item, i) =>
      (item.variants || []).map((v) => ({
        orderItemId: itemIds[i],
        variantId: v.variantId,
        variantOptionId: v.variantOptionId,
        organizationId: payload.organizationId,
      })),
    );

    const batchItems: BatchItem[] = [
      db.insert(orders).values({
        id: orderId,
        code: generateOrderCode(),
        customerId: payload.customerId,
        addressId: payload.addressId,
        paymentMethodId: payload.paymentMethodId,
        couponId: payload.couponId,
        couponDiscount,
        subTotal,
        discount,
        total,
        organizationId: payload.organizationId,
        orderSource: payload.orderSource || "WEBSITE",
      }) as unknown as BatchItem,
      db.insert(orderItems).values(itemRows) as unknown as BatchItem,
      db.insert(orderLifeCycles).values({
        orderId,
        orderStatus: ENUM_ORDER_STATUS.PENDING,
        organizationId: payload.organizationId,
      }) as unknown as BatchItem,
    ];

    if (variantRows.length) {
      batchItems.push(db.insert(orderItemVariants).values(variantRows) as unknown as BatchItem);
    }

    await db.batch(batchItems as [BatchItem, ...BatchItem[]]);

    return this.findOne(orderId, c);
  }

  async updateStatus(
    id: string,
    orderStatus: string,
    comments: string | undefined,
    updatedBy: string | undefined,
    c: Context,
  ) {
    const db = getDb(c);
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new NotFoundException("Order not found");

    await db.batch([
      db.update(orders).set({ orderStatus, updatedAt: new Date().toISOString(), updatedBy }).where(eq(orders.id, id)) as unknown as BatchItem,
      db.insert(orderLifeCycles).values({
        orderId: id,
        orderStatus,
        comments,
        organizationId: order.organizationId,
      }) as unknown as BatchItem,
    ]);

    return this.findOne(id, c);
  }

  async myOrders(customerId: string, organizationId: string | undefined, c: Context) {
    const db = getDb(c);
    const conds = [eq(orders.customerId, customerId)];
    if (organizationId) conds.push(eq(orders.organizationId, organizationId));
    return db.select().from(orders).where(and(...conds)).orderBy(desc(orders.createdAt));
  }

  async assignDeliveryman(orderId: string, deliverymanId: string, c: Context) {
    const db = getDb(c);
    await db
      .update(orders)
      .set({ deliverymanId, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, orderId));
    return this.findOne(orderId, c);
  }
}
