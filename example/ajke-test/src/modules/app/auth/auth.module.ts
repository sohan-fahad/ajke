import { Module } from "@ajke/core";
import { AuthController } from "./controllers/panel.auth.controller";
import { AuthDMController } from "./controllers/dm.auth.controller";
import { WebAuthController } from "./controllers/web.controller";
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./auth.guard";

@Module({
  controllers: [AuthController, AuthDMController, WebAuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule { }
