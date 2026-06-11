import { Module } from "@ajke/core";
import { OrderPanelController, OrderWebController, OrderDMController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  controllers: [OrderPanelController, OrderWebController, OrderDMController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
