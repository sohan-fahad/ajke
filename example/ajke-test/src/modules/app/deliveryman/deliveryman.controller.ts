import type { Context } from "hono";
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { DeliveryManService } from "./deliveryman.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateDeliveryManDTO, CreateDeliveryManDTOType,
  FilterDeliveryManDTO, FilterDeliveryManDTOType,
  UpdateDeliveryManDTO, UpdateDeliveryManDTOType,
} from "./deliveryman.dto";

@Controller("/v1/panel/delivery-man")
@UseGuards(AuthGuard)
export class DeliveryManPanelController {
  constructor(@Inject(DeliveryManService) private readonly svc: DeliveryManService) {}

  @Get()
  @QueryValidate(FilterDeliveryManDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterDeliveryManDTOType;
    return ResponseUtil.success(c, await this.svc.findAll(q as any, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }

  @Post()
  @ZodValidate(CreateDeliveryManDTO)
  async register(@Body() body: CreateDeliveryManDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.register(body as any, c), "Delivery man registered");
  }

  @Patch("/:id/status")
  @ZodValidate(UpdateDeliveryManDTO)
  async updateStatus(@Param("id") id: string, @Body() body: UpdateDeliveryManDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateStatus(id, body.status as string, c), "Status updated");
  }

  @Patch("/:id")
  @ZodValidate(UpdateDeliveryManDTO)
  async update(@Param("id") id: string, @Body() body: UpdateDeliveryManDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.update(id, body, c), "Updated");
  }
}

@Controller("/v1/dm/profile")
@UseGuards(AuthGuard)
export class DeliveryManProfileController {
  constructor(@Inject(DeliveryManService) private readonly svc: DeliveryManService) {}

  @Get()
  async getProfile(c: Context) {
    const authUser = c.get("authUser" as never) as { id: string; deliverymanId?: string };
    if (!authUser.deliverymanId) return c.json({ error: "Not a delivery man" }, 403);
    return ResponseUtil.success(c, await this.svc.findOne(authUser.deliverymanId, c));
  }

  @Patch("/duty-status")
  @ZodValidate(UpdateDeliveryManDTO)
  async updateDutyStatus(@Body() body: UpdateDeliveryManDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string; deliverymanId?: string };
    if (!authUser.deliverymanId) return c.json({ error: "Not a delivery man" }, 403);
    return ResponseUtil.success(c, await this.svc.updateDutyStatus(authUser.deliverymanId, body.dutyStatus as string, c));
  }
}
