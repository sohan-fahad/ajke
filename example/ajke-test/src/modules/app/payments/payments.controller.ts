import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { PaymentsService } from "./payments.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreatePaymentMethodDTO, CreatePaymentMethodDTOType,
  UpdatePaymentMethodDTO, UpdatePaymentMethodDTOType,
  FilterPaymentMethodDTO, FilterPaymentMethodDTOType,
} from "./payments.dto";

@Controller("/v1/panel/payment-methods")
@UseGuards(AuthGuard)
export class PaymentMethodController {
  constructor(@Inject(PaymentsService) private readonly svc: PaymentsService) { }

  @Get()
  @QueryValidate(FilterPaymentMethodDTO)
  async findAll(@Query() q: FilterPaymentMethodDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAllMethods(c, q));
  }

  @Post()
  @ZodValidate(CreatePaymentMethodDTO)
  async create(@Body() body: CreatePaymentMethodDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createMethod(body, c), "Payment method created");
  }

  @Patch("/:id")
  @ZodValidate(UpdatePaymentMethodDTO)
  async update(@Param("id") id: string, @Body() body: UpdatePaymentMethodDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateMethod(id, body, c), "Payment method updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteMethod(id, c));
  }
}

@Controller("/v1/payment-methods")
export class PaymentMethodPublicController {
  constructor(@Inject(PaymentsService) private readonly svc: PaymentsService) { }

  @Get()
  async findAll(@Query() q: Record<string, string>, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAllMethods(q, c));
  }
}

@Controller("/v1/panel/payment-logs")
@UseGuards(AuthGuard)
export class PaymentLogController {
  constructor(@Inject(PaymentsService) private readonly svc: PaymentsService) { }

  @Get()
  async findAll(@Query() q: Record<string, string>, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAllLogs(q, c));
  }
}
