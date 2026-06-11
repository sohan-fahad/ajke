import { Module } from "@ajke/core";
import { TransactionController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  controllers: [TransactionController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
