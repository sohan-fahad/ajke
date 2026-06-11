import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { carts, cartItems, cartItemVariants } from "./carts.entity";

@Injectable()
export class CartsService {
  async getMyCart(userId: string, workspaceId: string | undefined, c: Context) {
    const db = getDb(c);
    const conds = [eq(carts.userId, userId)];
    if (workspaceId) conds.push(eq(carts.workspaceId, workspaceId));
    let [cart] = await db.select().from(carts).where(and(...conds)).limit(1);

    if (!cart) {
      const [newCart] = await db.insert(carts).values({ userId, workspaceId }).returning();
      cart = newCart;
    }

    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).orderBy(cartItems.createdAt);
    const itemIds = items.map((i) => i.id);
    const variants = itemIds.length ? await db.select().from(cartItemVariants).where(eq(cartItemVariants.cartItemId, items[0].id)) : [];

    return { ...cart, cartItems: items };
  }

  async syncToCart(userId: string, cartData: { productId: string; quantity: number; variants?: { variantId: string; variantOptionId: string }[]; workspaceId?: string }[], c: Context) {
    const db = getDb(c);
    const workspaceId = cartData[0]?.workspaceId;
    const conds = [eq(carts.userId, userId)];
    if (workspaceId) conds.push(eq(carts.workspaceId, workspaceId));

    let [cart] = await db.select().from(carts).where(and(...conds)).limit(1);
    if (!cart) {
      const [newCart] = await db.insert(carts).values({ userId, workspaceId }).returning();
      cart = newCart;
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    for (const item of cartData) {
      const [cartItem] = await db
        .insert(cartItems)
        .values({ cartId: cart.id, productId: item.productId, quantity: item.quantity, workspaceId })
        .returning();

      if (item.variants?.length) {
        for (const v of item.variants) {
          await db.insert(cartItemVariants).values({ cartItemId: cartItem.id, variantId: v.variantId, variantOptionId: v.variantOptionId, workspaceId });
        }
      }
    }

    return this.getMyCart(userId, workspaceId, c);
  }

  async clearCart(userId: string, workspaceId: string | undefined, c: Context) {
    const db = getDb(c);
    const conds = [eq(carts.userId, userId)];
    if (workspaceId) conds.push(eq(carts.workspaceId, workspaceId));
    const [cart] = await db.select().from(carts).where(and(...conds)).limit(1);
    if (cart) await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return { message: "Cart cleared" };
  }
}
