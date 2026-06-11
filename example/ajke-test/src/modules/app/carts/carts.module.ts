import { Module } from "@ajke/core";
import { CartController } from "./carts.controller";
import { CartsService } from "./carts.service";

@Module({
  controllers: [CartController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
