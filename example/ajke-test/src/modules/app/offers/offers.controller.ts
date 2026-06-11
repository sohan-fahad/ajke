import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { OffersService } from "./offers.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateCouponDTO, CreateCouponDTOType, FilterCouponDTO, FilterCouponDTOType, UpdateCouponDTO, UpdateCouponDTOType } from "./offers.dto";
import { CreateDiscountDTO, CreateDiscountDTOType, FilterDiscountDTO, FilterDiscountDTOType, UpdateDiscountDTO, UpdateDiscountDTOType } from "../products/products.dto";

@Controller("/v1/panel/discounts")
@UseGuards(AuthGuard)
export class DiscountController {
  constructor(@Inject(OffersService) private readonly svc: OffersService) {}

  @Get()
  @QueryValidate(FilterDiscountDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterDiscountDTOType;
    return ResponseUtil.success(c, await this.svc.findAllDiscounts(q as any, c));
  }

  @Post()
  @ZodValidate(CreateDiscountDTO)
  async create(@Body() body: CreateDiscountDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createDiscount(body, c), "Discount created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateDiscountDTO)
  async update(@Param("id") id: string, @Body() body: UpdateDiscountDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateDiscount(id, body, c), "Discount updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteDiscount(id, c));
  }
}

@Controller("/v1/panel/coupons")
@UseGuards(AuthGuard)
export class CouponController {
  constructor(@Inject(OffersService) private readonly svc: OffersService) {}

  @Get()
  @QueryValidate(FilterCouponDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterCouponDTOType;
    return ResponseUtil.success(c, await this.svc.findAllCoupons(q as any, c));
  }

  @Post()
  @ZodValidate(CreateCouponDTO)
  async create(@Body() body: CreateCouponDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createCoupon(body, c), "Coupon created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateCouponDTO)
  async update(@Param("id") id: string, @Body() body: UpdateCouponDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateCoupon(id, body, c), "Coupon updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteCoupon(id, c));
  }
}
