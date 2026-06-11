import { Module } from "@ajke/core";
import { DiscountController, CouponController } from "./offers.controller";
import { OffersService } from "./offers.service";

@Module({
  controllers: [DiscountController, CouponController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
