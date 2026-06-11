import { Module } from "@ajke/core";
import { DeliveryManPanelController, DeliveryManProfileController } from "./deliveryman.controller";
import { DeliveryManService } from "./deliveryman.service";

@Module({
  controllers: [DeliveryManPanelController, DeliveryManProfileController],
  providers: [DeliveryManService],
  exports: [DeliveryManService],
})
export class DeliveryManModule {}
