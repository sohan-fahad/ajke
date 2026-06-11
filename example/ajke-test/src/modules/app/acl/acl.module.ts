import { Module } from "@ajke/core";
import { RoleController, PermissionController, PermissionTypeController } from "./acl.controller";
import { AclService } from "./acl.service";

@Module({
  controllers: [RoleController, PermissionController, PermissionTypeController],
  providers: [AclService],
  exports: [AclService],
})
export class AclModule {}
