import type { Context } from "hono";
import { Controller, Post, Body, Get, UseGuards } from "@ajke/core";
import { ZodValidate } from "@ajke/core";
import { LoginDTO, RegisterDTO, RefreshTokenDTO, SendOtpDTO, VerifyOtpDTO, ResetPasswordDTO, VerifyResetPasswordDTO, ChangePasswordDTO, LoginDMDTO, LoginDTOType, RegisterDTOType, RefreshTokenDTOType, SendOtpDTOType, VerifyOtpDTOType, ResetPasswordDTOType, VerifyResetPasswordDTOType, ChangePasswordDTOType, LoginDMDTOType } from "../dtos/auth.dto";
import { AuthGuard } from "../auth.guard";
import { Inject } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { AuthService } from "../services/auth.service";



@Controller("/v1/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) { }

  @Post("/login")
  @ZodValidate(LoginDTO)
  async login(@Body() body: LoginDTOType, c: Context) {
    const data = await this.authService.loginUser(body, c);
    return ResponseUtil.success(c, data, "Login success");
  }

  @Post("/register")
  @ZodValidate(RegisterDTO)
  async register(@Body() body: RegisterDTOType, c: Context) {
    console.log("body", body);
    const data = await this.authService.registerUser(body, c);
    return ResponseUtil.success(c, data, "User registered successfully");
  }

  @Post("/refresh-token")
  @ZodValidate(RefreshTokenDTO)
  async refreshToken(@Body() body: RefreshTokenDTOType, c: Context) {
    const data = await this.authService.refreshToken(body, c);
    return ResponseUtil.success(c, data, "Refresh token success");
  }

  @Post("/send-otp")
  @ZodValidate(SendOtpDTO)
  async sendOtp(@Body() body: SendOtpDTOType, c: Context) {
    const data = await this.authService.sendOtp(body, c);
    return ResponseUtil.success(c, data, "OTP sent successfully");
  }

  @Post("/verify-otp")
  @ZodValidate(VerifyOtpDTO)
  async verifyOtp(@Body() body: VerifyOtpDTOType, c: Context) {
    const data = await this.authService.verifyOtp(body, c);
    return ResponseUtil.success(c, data, "OTP verified successfully");
  }

  @Post("/reset-password")
  @ZodValidate(ResetPasswordDTO)
  async resetPassword(@Body() body: ResetPasswordDTOType, c: Context) {
    const data = await this.authService.resetPassword(body, c);
    return ResponseUtil.success(c, data, "OTP sent to email");
  }

  @Post("/reset-password/verify")
  @ZodValidate(VerifyResetPasswordDTO)
  async verifyResetPassword(@Body() body: VerifyResetPasswordDTOType, c: Context) {
    const data = await this.authService.verifyResetPassword(body, c);
    return ResponseUtil.success(c, data, "Password reset successfully");
  }

  @Post("/change-password")
  @UseGuards(AuthGuard)
  @ZodValidate(ChangePasswordDTO)
  async changePassword(@Body() body: ChangePasswordDTOType, c: Context) {
    const authUser = c.get("authUser" as never);
    const data = await this.authService.changePassword(body, authUser.id, c);
    return ResponseUtil.success(c, data);
  }
}

@Controller("/v1/dm/auth")
export class AuthDMController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) { }

  @Post("/login")
  @ZodValidate(LoginDMDTO)
  async loginDM(@Body() body: LoginDMDTOType, c: Context) {
    const data = await this.authService.loginDM(body, c);
    return ResponseUtil.success(c, data, "Login success");
  }

  @Post("/refresh-token")
  @ZodValidate(RefreshTokenDTO)
  async refreshToken(@Body() body: RefreshTokenDTOType, c: Context) {
    const data = await this.authService.refreshToken(body, c);
    return ResponseUtil.success(c, data, "Refresh token success");
  }
}
