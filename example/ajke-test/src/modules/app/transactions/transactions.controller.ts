import type { Context } from "hono";
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Inject, ZodValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { TransactionsService } from "./transactions.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateTransactionDTO, CreateTransactionDTOType, UpdateTransactionDTO, UpdateTransactionDTOType } from "./transactions.dto";

@Controller("/v1/panel/transactions")
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(@Inject(TransactionsService) private readonly svc: TransactionsService) {}

  @Get()
  async findAll(@Query() q: Record<string, string>, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAll(q, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }

  @Post()
  @ZodValidate(CreateTransactionDTO)
  async create(@Body() body: CreateTransactionDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.create(body, c), "Transaction created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateTransactionDTO)
  async updateStatus(@Param("id") id: string, @Body() body: UpdateTransactionDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateStatus(id, body.status as string, c), "Transaction updated");
  }
}
