import type { Context } from "hono";
import { Controller, Get, Post, Body, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { BusinessService } from "./business.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateBusinessConfigDTO, CreateBusinessConfigDTOType, FilterBusinessConfigDTO, FilterBusinessConfigDTOType } from "./business.dto";

@Controller("/v1/panel/business")
@UseGuards(AuthGuard)
export class BusinessController {
  constructor(@Inject(BusinessService) private readonly svc: BusinessService) {}

  @Get("/config")
  @QueryValidate(FilterBusinessConfigDTO)
  async getConfig(c: Context) {
    const q = c.get("validatedQuery") as FilterBusinessConfigDTOType;
    return ResponseUtil.success(c, await this.svc.findOne(q.organizationId as string, c));
  }

  @Post("/config")
  @ZodValidate(CreateBusinessConfigDTO)
  async upsertConfig(@Body() body: CreateBusinessConfigDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.upsert(body, c), "Config saved");
  }
}

@Controller("/v1/web/business")
export class BusinessPublicController {
  constructor(@Inject(BusinessService) private readonly svc: BusinessService) {}

  @Get("/config")
  @QueryValidate(FilterBusinessConfigDTO)
  async getConfig(c: Context) {
    const q = c.get("validatedQuery") as FilterBusinessConfigDTOType;
    return ResponseUtil.success(c, await this.svc.findOne(q.organizationId as string, c));
  }
}
