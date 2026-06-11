import type { Context } from "hono";
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { OrdersService } from "./orders.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateOrderDTO, CreateOrderDTOType,
  FilterOrderDTO, FilterOrderDTOType,
  FindMyOrderDTO, FindMyOrderDTOType,
  UpdateOrderStatusDTO, UpdateOrderStatusDTOType,
} from "./orders.dto";

@Controller("/v1/panel/orders")
@UseGuards(AuthGuard)
export class OrderPanelController {
  constructor(@Inject(OrdersService) private readonly svc: OrdersService) {}

  @Get()
  @QueryValidate(FilterOrderDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterOrderDTOType;
    return ResponseUtil.success(c, await this.svc.findAll(q as any, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }

  @Post()
  @ZodValidate(CreateOrderDTO)
  async create(@Body() body: CreateOrderDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.createOrder({ ...body, customerId: authUser.id, orderSource: "ADMIN_PANEL" } as any, c), "Order created");
  }

  @Patch("/:id/status")
  @ZodValidate(UpdateOrderStatusDTO)
  async updateStatus(@Param("id") id: string, @Body() body: UpdateOrderStatusDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.updateStatus(id, body.orderStatus, body.comments, authUser.id, c), "Order status updated");
  }

  @Patch("/:id/assign-deliveryman")
  async assignDeliveryman(@Param("id") id: string, @Body() body: { deliverymanId: string }, c: Context) {
    return ResponseUtil.success(c, await this.svc.assignDeliveryman(id, body.deliverymanId, c), "Deliveryman assigned");
  }
}

@Controller("/v1/orders")
@UseGuards(AuthGuard)
export class OrderWebController {
  constructor(@Inject(OrdersService) private readonly svc: OrdersService) {}

  @Post()
  @ZodValidate(CreateOrderDTO)
  async create(@Body() body: CreateOrderDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.createOrder({ ...body, customerId: authUser.id } as any, c), "Order placed");
  }

  @Get("/my-orders")
  @QueryValidate(FindMyOrderDTO)
  async myOrders(c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    const q = c.get("validatedQuery") as FindMyOrderDTOType;
    return ResponseUtil.success(c, await this.svc.myOrders(authUser.id, q.workspaceId, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }
}

@Controller("/v1/dm/orders")
@UseGuards(AuthGuard)
export class OrderDMController {
  constructor(@Inject(OrdersService) private readonly svc: OrdersService) {}

  @Get()
  @QueryValidate(FilterOrderDTO)
  async findAll(c: Context) {
    const authUser = c.get("authUser" as never) as { id: string; deliverymanId?: string };
    const q = c.get("validatedQuery") as FilterOrderDTOType;
    return ResponseUtil.success(c, await this.svc.findAll({ ...q, deliverymanId: authUser.deliverymanId } as any, c));
  }

  @Patch("/:id/status")
  @ZodValidate(UpdateOrderStatusDTO)
  async updateStatus(@Param("id") id: string, @Body() body: UpdateOrderStatusDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.updateStatus(id, body.orderStatus, body.comments, authUser.id, c));
  }
}
