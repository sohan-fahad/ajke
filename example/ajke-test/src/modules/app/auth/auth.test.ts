import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { AuthService } from "./services/auth.service";

const USER_PAYLOAD = { email: "test@example.com", password: "password123" };
const service = new AuthService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM user_roles").run();
  await env.DB.prepare("DELETE FROM users").run();
  await env.DB.prepare("DELETE FROM roles").run();
});

describe("AuthService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("AuthService.registerUser", () => {
  it("creates a user and returns safe user without password", async () => {
    console.log("[registerUser] payload:", USER_PAYLOAD);
    const result = await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[registerUser] result:", result);

    expect(result.id).toBeDefined();
    expect(result.email).toBe("test@example.com");
    expect((result as Record<string, unknown>).password).toBeUndefined();

    const row = await env.DB.prepare("SELECT id, email FROM users WHERE email = ?")
      .bind("test@example.com")
      .first<{ id: string; email: string }>();

    console.log("[registerUser] DB row:", row);
    expect(row).not.toBeNull();
    expect(row?.email).toBe("test@example.com");
  });

  it("throws ConflictException when user already exists", async () => {
    await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[registerUser] registering duplicate");
    await expect(service.registerUser(makeContext(), USER_PAYLOAD)).rejects.toThrow("User already exists");
  });

  it("assigns customer role when role exists", async () => {
    await env.DB.prepare("INSERT INTO roles (id, title) VALUES ('role-1', 'Customer')").run();

    const result = await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[registerUser] user with role:", result.id);

    const userRole = await env.DB.prepare("SELECT role_id FROM user_roles WHERE user_id = ?")
      .bind(result.id)
      .first<{ role_id: string }>();

    console.log("[registerUser] user_roles row:", userRole);
    expect(userRole?.role_id).toBe("role-1");
  });
});

describe("AuthService.loginUser", () => {
  it("returns tokens and safe user on valid credentials", async () => {
    await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[loginUser] logging in:", USER_PAYLOAD.email);

    const result = await service.loginUser(makeContext(), USER_PAYLOAD);
    console.log("[loginUser] result:", { ...result, token: result.token?.slice(0, 20) });

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.permissionToken).toBeDefined();
    expect(result.user.email).toBe("test@example.com");
    expect((result.user as Record<string, unknown>).password).toBeUndefined();
  });

  it("throws when user does not exist", async () => {
    console.log("[loginUser] nonexistent user");
    await expect(service.loginUser(makeContext(), { email: "ghost@example.com", password: "password123" })).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("throws when password is wrong", async () => {
    await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[loginUser] wrong password attempt");
    await expect(service.loginUser(makeContext(), { email: USER_PAYLOAD.email, password: "wrongpassword" })).rejects.toThrow(
      "Invalid credentials",
    );
  });
});

describe("AuthService.refreshToken", () => {
  it("returns new tokens with valid refresh token", async () => {
    await service.registerUser(makeContext(), USER_PAYLOAD);
    const login = await service.loginUser(makeContext(), USER_PAYLOAD);
    console.log("[refreshToken] using refresh token from login");

    const result = await service.refreshToken(makeContext(), { refreshToken: login.refreshToken });
    console.log("[refreshToken] result:", { ...result, token: result.token?.slice(0, 20) });

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.permissionToken).toBeDefined();
    expect(result.user.id).toBeDefined();
  });

  it("throws on invalid token string", async () => {
    console.log("[refreshToken] invalid token");
    await expect(service.refreshToken(makeContext(), { refreshToken: "not-a-real-token" })).rejects.toThrow("Invalid token");
  });
});

describe("AuthService.changePassword", () => {
  it("changes password and allows login with new password", async () => {
    const registered = await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[changePassword] user:", registered.id);

    const changeResult = await service.changePassword(
      makeContext(),
      { oldPassword: USER_PAYLOAD.password, newPassword: "newpassword456" },
      registered.id,
    );
    console.log("[changePassword] result:", changeResult);
    expect(changeResult.message).toBe("Password changed successfully");

    const loginResult = await service.loginUser(makeContext(), { email: USER_PAYLOAD.email, password: "newpassword456" });
    expect(loginResult.token).toBeDefined();
  });

  it("throws when old password is wrong", async () => {
    const registered = await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[changePassword] wrong old password for user:", registered.id);

    await expect(
      service.changePassword(makeContext(), { oldPassword: "wrongpassword", newPassword: "newpassword456" }, registered.id),
    ).rejects.toThrow("Invalid old password");
  });
});

describe("AuthService.resetPassword + verifyResetPassword", () => {
  it("sends reset OTP and verifies it to set new password", async () => {
    await service.registerUser(makeContext(), USER_PAYLOAD);
    console.log("[resetPassword] requesting reset for:", USER_PAYLOAD.email);

    const resetResult = await service.resetPassword(makeContext(), { email: USER_PAYLOAD.email });
    console.log("[resetPassword] result:", { email: resetResult.email, hasHash: !!resetResult.hash, hasOtp: !!resetResult.otp });

    expect(resetResult.email).toBe(USER_PAYLOAD.email);
    expect(resetResult.hash).toBeDefined();
    expect(resetResult.otp).toBeDefined();

    const verifyResult = await service.verifyResetPassword(
      makeContext(),
      { email: USER_PAYLOAD.email, otp: resetResult.otp!, newPassword: "resetpassword789", hash: resetResult.hash },
    );
    console.log("[verifyResetPassword] result:", verifyResult);
    expect(verifyResult.message).toBe("Password reset successfully. Please login");

    const loginResult = await service.loginUser(makeContext(), { email: USER_PAYLOAD.email, password: "resetpassword789" });
    expect(loginResult.token).toBeDefined();
  });

  it("throws when email does not exist", async () => {
    console.log("[resetPassword] unknown email");
    await expect(service.resetPassword(makeContext(), { email: "ghost@example.com" })).rejects.toThrow("User not found");
  });

  it("throws verifyResetPassword on wrong OTP", async () => {
    await service.registerUser(makeContext(), USER_PAYLOAD);
    const resetResult = await service.resetPassword(makeContext(), { email: USER_PAYLOAD.email });
    console.log("[verifyResetPassword] wrong OTP attempt");

    await expect(
      service.verifyResetPassword(
        makeContext(),
        { email: USER_PAYLOAD.email, otp: 1234, newPassword: "resetpassword789", hash: resetResult.hash },
      ),
    ).rejects.toThrow("Invalid OTP");
  });
});

describe("AuthService.sendOtp + verifyOtp", () => {
  it("sends OTP for a new phone number and creates user", async () => {
    const phoneNumber = "+1234567890";
    console.log("[sendOtp] phone:", phoneNumber);

    const result = await service.sendOtp(makeContext(), { phoneNumber });
    console.log("[sendOtp] result:", { hasHash: !!result.hash, expiryInSec: result.expiryInSec, hasOtp: !!result.otp });

    expect(result.hash).toBeDefined();
    expect(result.expiryInSec).toBe(300);
    expect(result.otp).toBeDefined();

    const row = await env.DB.prepare("SELECT phone_number FROM users WHERE phone_number = ?")
      .bind(phoneNumber)
      .first<{ phone_number: string }>();
    expect(row?.phone_number).toBe(phoneNumber);
  });

  it("sends OTP for existing phone number without creating duplicate", async () => {
    const phoneNumber = "+1234567890";
    await service.sendOtp(makeContext(), { phoneNumber });
    await service.sendOtp(makeContext(), { phoneNumber });

    const count = await env.DB.prepare("SELECT COUNT(*) as cnt FROM users WHERE phone_number = ?")
      .bind(phoneNumber)
      .first<{ cnt: number }>();

    console.log("[sendOtp] duplicate check count:", count?.cnt);
    expect(count?.cnt).toBe(1);
  });

  it("verifies OTP and returns tokens", async () => {
    const phoneNumber = "+9876543210";
    const { otp, hash } = await service.sendOtp(makeContext(), { phoneNumber });
    console.log("[verifyOtp] verifying OTP for:", phoneNumber);

    const result = await service.verifyOtp(makeContext(), { phoneNumber, otp: otp!, hash });
    console.log("[verifyOtp] result:", { ...result, token: result.token?.slice(0, 20) });

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBeDefined();
  });

  it("throws on invalid OTP hash", async () => {
    const phoneNumber = "+9876543210";
    await service.sendOtp(makeContext(), { phoneNumber });
    console.log("[verifyOtp] invalid hash attempt");

    await expect(service.verifyOtp(makeContext(), { phoneNumber, otp: 111111, hash: "badhash" })).rejects.toThrow(
      "Invalid or expired OTP",
    );
  });
});
