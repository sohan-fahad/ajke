import { z } from "zod";

export const LoginDTO = z.object({
    email: z.email().optional(),
    username: z.string().optional(),
    password: z.string().min(6),
    workspaceId: z.string().optional(),
});

export const RegisterDTO = z.object({
    email: z.email("Email is required"),
    username: z.string().optional(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const RefreshTokenDTO = z.object({
    refreshToken: z.string(),
    workspaceId: z.string().optional(),
});

export const SendOtpDTO = z.object({
    phoneNumber: z.string(),
    workspaceId: z.string().optional(),
});

export const VerifyOtpDTO = z.object({
    phoneNumber: z.string(),
    otp: z.number().int(),
    hash: z.string(),
    workspaceId: z.string().optional(),
});

export const ResetPasswordDTO = z.object({
    email: z.email(),
    workspaceId: z.string().optional(),
});

export const VerifyResetPasswordDTO = z.object({
    email: z.email(),
    otp: z.number().int(),
    newPassword: z.string().min(6),
    hash: z.string(),
    workspaceId: z.string().optional(),
});

export const ChangePasswordDTO = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(6),
});

export const LoginDMDTO = z.object({
    phoneNumber: z.string(),
    password: z.string(),
    workspaceId: z.string().optional(),
});

export type LoginDTOType = z.infer<typeof LoginDTO>;
export type RegisterDTOType = z.infer<typeof RegisterDTO>;
export type RefreshTokenDTOType = z.infer<typeof RefreshTokenDTO>;
export type SendOtpDTOType = z.infer<typeof SendOtpDTO>;
export type VerifyOtpDTOType = z.infer<typeof VerifyOtpDTO>;
export type ResetPasswordDTOType = z.infer<typeof ResetPasswordDTO>;
export type VerifyResetPasswordDTOType = z.infer<typeof VerifyResetPasswordDTO>;
export type ChangePasswordDTOType = z.infer<typeof ChangePasswordDTO>;
export type LoginDMDTOType = z.infer<typeof LoginDMDTO>;