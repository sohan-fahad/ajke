import { Module } from "@ajke/core";
import { PaymentMethodController, PaymentMethodPublicController, PaymentLogController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  controllers: [PaymentMethodController, PaymentMethodPublicController, PaymentLogController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
