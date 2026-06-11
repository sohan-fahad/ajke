import type { Context } from "hono";
import { Controller, Post, Body, Inject } from "@ajke/core";
import { ZodValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import {
  LoginDMDTO, RefreshTokenDTO,
  LoginDMDTOType, RefreshTokenDTOType,
} from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";

@Controller("/v1/dm/auth")
export class AuthDMController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) { }

  @Post("/login")
  @ZodValidate(LoginDMDTO)
  async loginDM(@Body() body: LoginDMDTOType, c: Context) {
    const data = await this.authService.loginDM(c, body);
    return ResponseUtil.success(c, data, "Login success");
  }

  @Post("/refresh-token")
  @ZodValidate(RefreshTokenDTO)
  async refreshToken(@Body() body: RefreshTokenDTOType, c: Context) {
    const data = await this.authService.refreshToken(c, body);
    return ResponseUtil.success(c, data, "Refresh token success");
  }
}
