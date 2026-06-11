import type { Context } from "hono";
import { Controller, Get, Post, Delete, Body, Query, UseGuards, Inject, ZodValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { CartsService } from "./carts.service";
import { AuthGuard } from "../auth/auth.guard";
import { AddToCartDTO, AddToCartDTOType } from "./carts.dto";

@Controller("/v1/carts")
@UseGuards(AuthGuard)
export class CartController {
  constructor(@Inject(CartsService) private readonly svc: CartsService) {}

  @Get("/my-cart")
  async myCart(@Query() q: Record<string, string>, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.getMyCart(authUser.id, q.workspaceId, c));
  }

  @Post("/sync-to-cart")
  @ZodValidate(AddToCartDTO)
  async syncToCart(@Body() body: AddToCartDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.syncToCart(authUser.id, body as any, c));
  }

  @Delete("/clear")
  async clearCart(@Query() q: Record<string, string>, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.clearCart(authUser.id, q.workspaceId, c));
  }
}
