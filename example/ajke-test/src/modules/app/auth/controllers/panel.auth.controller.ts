import type { Context } from "hono";
import { Controller, Post, Body, UseGuards, Inject } from "@ajke/core";
import { ZodValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import {
  LoginDTO, RegisterDTO, RefreshTokenDTO, SendOtpDTO, VerifyOtpDTO,
  ResetPasswordDTO, VerifyResetPasswordDTO, ChangePasswordDTO,
  LoginDTOType, RegisterDTOType, RefreshTokenDTOType, SendOtpDTOType,
  VerifyOtpDTOType, ResetPasswordDTOType, VerifyResetPasswordDTOType, ChangePasswordDTOType,
} from "../dtos/auth.dto";
import { AuthGuard } from "../auth.guard";
import { AuthService } from "../services/auth.service";

@Controller("/v1/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) { }

  @Post("/login")
  @ZodValidate(LoginDTO)
  async login(@Body() body: LoginDTOType, c: Context) {
    const data = await this.authService.loginUser(c, body);
    return ResponseUtil.success(c, data, "Login success");
  }

  @Post("/register")
  @ZodValidate(RegisterDTO)
  async register(@Body() body: RegisterDTOType, c: Context) {
    const data = await this.authService.registerUser(c, body);
    return ResponseUtil.success(c, data, "User registered successfully");
  }

  @Post("/refresh-token")
  @ZodValidate(RefreshTokenDTO)
  async refreshToken(@Body() body: RefreshTokenDTOType, c: Context) {
    const data = await this.authService.refreshToken(c, body);
    return ResponseUtil.success(c, data, "Refresh token success");
  }

  @Post("/send-otp")
  @ZodValidate(SendOtpDTO)
  async sendOtp(@Body() body: SendOtpDTOType, c: Context) {
    const data = await this.authService.sendOtp(c, body);
    return ResponseUtil.success(c, data, "OTP sent successfully");
  }

  @Post("/verify-otp")
  @ZodValidate(VerifyOtpDTO)
  async verifyOtp(@Body() body: VerifyOtpDTOType, c: Context) {
    const data = await this.authService.verifyOtp(c, body);
    return ResponseUtil.success(c, data, "OTP verified successfully");
  }

  @Post("/reset-password")
  @ZodValidate(ResetPasswordDTO)
  async resetPassword(@Body() body: ResetPasswordDTOType, c: Context) {
    const data = await this.authService.resetPassword(c, body);
    return ResponseUtil.success(c, data, "OTP sent to email");
  }

  @Post("/reset-password/verify")
  @ZodValidate(VerifyResetPasswordDTO)
  async verifyResetPassword(@Body() body: VerifyResetPasswordDTOType, c: Context) {
    const data = await this.authService.verifyResetPassword(c, body);
    return ResponseUtil.success(c, data, "Password reset successfully");
  }

  @Post("/change-password")
  @UseGuards(AuthGuard)
  @ZodValidate(ChangePasswordDTO)
  async changePassword(@Body() body: ChangePasswordDTOType, c: Context) {
    const authUser = c.get("authUser" as never);
    const data = await this.authService.changePassword(c, body, authUser.id);
    return ResponseUtil.success(c, data);
  }
}
