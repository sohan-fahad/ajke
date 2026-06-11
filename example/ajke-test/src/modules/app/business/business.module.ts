import { Module } from "@ajke/core";
import { BusinessController, BusinessPublicController } from "./business.controller";
import { BusinessService } from "./business.service";

@Module({
  controllers: [BusinessController, BusinessPublicController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
