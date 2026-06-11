import { Module } from "@ajke/core";
import { UserPanelController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserPanelController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
