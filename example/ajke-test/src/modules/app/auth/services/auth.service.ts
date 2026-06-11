import { Injectable, BadRequestException, NotFoundException, ConflictException } from "@ajke/core";
import type { AppContext } from "@ajke/core";
import { eq, and } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { users, userRoles } from "../../user/user.entity";
import { roles, rolePermissions, permissions } from "../../acl/acl.entity";
import { deliverymen } from "../../deliveryman/deliveryman.entity";
import { ENUM_ACL_DEFAULT_ROLES, ENUM_DELIVERY_MAN_STATUS } from "../../../../shared";
import { signToken, verifyToken, generateOtpHash, verifyOtpHash, generateOTP } from "../jwt.helper";
import { hashPassword, comparePassword } from "../../user/bcrypt.helper";
import { ulid } from "ulid";

@Injectable()
export class AuthService {

  private getSecret(c: AppContext): string {
    return (c.env.JWT_SECRET as string) || "local-dev-secret-change-in-production";
  }

  private async buildTokens(userId: string, c: AppContext) {
    const db = getDb(c);

    const [userRoleRows, permList] = await db.batch([
      db
        .select({ title: roles.title })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId)),
      db
        .select({ title: permissions.title })
        .from(rolePermissions)
        .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId)),
    ]);

    const roleNames = userRoleRows.map((ur) => ur.title);
    const permTitles = permList.map((p) => p.title);
    const secret = this.getSecret(c);
    const expiresIn = (c.env.JWT_EXPIRES_IN as string) || "7d";
    const refreshExpiresIn = (c.env.JWT_REFRESH_EXPIRES_IN as string) || "30d";

    const [token, refreshToken, permissionToken] = await Promise.all([
      signToken({ user: { id: userId, roles: roleNames } }, secret, expiresIn),
      signToken({ user: { id: userId }, isRefreshToken: true }, secret, refreshExpiresIn),
      signToken({ permissions: permTitles }, secret, refreshExpiresIn),
    ]);

    return { token, refreshToken, permissionToken, roles: roleNames };
  }

  async loginUser(c: AppContext, payload: { email?: string; username?: string; password: string; workspaceId?: string; }) {
    const db = getDb(c);
    const where = payload.email
      ? and(eq(users.email, payload.email), payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined)
      : and(eq(users.username, payload.username!), payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined);

    const [user] = await db.select().from(users).where(where).limit(1);
    if (!user) throw new BadRequestException("Invalid credentials");
    if (!user.isActive) throw new BadRequestException("User is not active");

    const isMatch = await comparePassword(payload.password, user.password || "");
    if (!isMatch) throw new BadRequestException("Invalid credentials");

    const { token, refreshToken, permissionToken } = await this.buildTokens(user.id, c);

    const { password: _, accessToken: __, refreshToken: ___, permissionToken: ____, ...safeUser } = user;
    return { token, refreshToken, permissionToken, user: safeUser };
  }

  async loginDM(c: AppContext, payload: { phoneNumber: string; password: string; workspaceId?: string; }) {
    const db = getDb(c);
    const where = and(
      eq(users.phoneNumber, payload.phoneNumber),
      payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined,
    );

    const [user] = await db.select().from(users).where(where).limit(1);
    if (!user) throw new BadRequestException("Invalid credentials");

    const isMatch = await comparePassword(payload.password, user.password || "");
    if (!isMatch) throw new BadRequestException("Invalid credentials");

    const [userRoleRows, dmRows] = await db.batch([
      db
        .select({ title: roles.title, id: roles.id })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id)),
      db.select().from(deliverymen).where(eq(deliverymen.userId, user.id)).limit(1),
    ]);

    const roleNames = userRoleRows.map((ur) => ur.title);
    if (!roleNames.includes(ENUM_ACL_DEFAULT_ROLES.DELIVERY_MAN)) {
      throw new NotFoundException("Delivery Man not found");
    }

    const dm = dmRows[0];
    if (!dm) throw new BadRequestException("Delivery Man not found");
    if (dm.status !== ENUM_DELIVERY_MAN_STATUS.ACTIVE) throw new BadRequestException("Delivery Man is not active");

    const secret = this.getSecret(c);
    const expiresIn = (c.env.JWT_EXPIRES_IN as string) || "7d";
    const refreshExpiresIn = (c.env.JWT_REFRESH_EXPIRES_IN as string) || "30d";

    const [token, refreshToken] = await Promise.all([
      signToken({ user: { id: user.id, roles: roleNames, deliverymanId: dm.id } }, secret, expiresIn),
      signToken({ user: { id: user.id }, isRefreshToken: true }, secret, refreshExpiresIn),
    ]);

    return { token, refreshToken, user: { id: user.id, roles: roleNames, deliverymanId: dm.id } };
  }

  async refreshToken(c: AppContext, payload: { refreshToken: string; workspaceId?: string; }) {
    const secret = this.getSecret(c);
    let decoded: Awaited<ReturnType<typeof verifyToken>>;
    try {
      decoded = await verifyToken(payload.refreshToken, secret);
    } catch {
      throw new BadRequestException("Invalid token");
    }

    if (!decoded.isRefreshToken || !decoded.user?.id) {
      throw new BadRequestException("Invalid token");
    }

    const db = getDb(c);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.user.id)).limit(1);
    if (!user) throw new NotFoundException("User not found");

    const { token, refreshToken, permissionToken, roles: roleNames } = await this.buildTokens(user.id, c);
    return { token, refreshToken, permissionToken, user: { id: user.id, roles: roleNames } };
  }

  async registerUser(
    c: AppContext,
    payload: { email?: string; username?: string; password: string; firstName?: string; lastName?: string; phoneNumber?: string; workspaceId?: string; },
  ) {
    const db = getDb(c);
    const hashedPassword = await hashPassword(payload.password);
    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ") || undefined;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          payload.email ? eq(users.email, payload.email) : eq(users.username, payload.username!),
          payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined,
        ),
      )
      .limit(1);

    if (existing) throw new ConflictException("User already exists");

    const customerRoleWhere = and(
      eq(roles.title, ENUM_ACL_DEFAULT_ROLES.CUSTOMER),
      payload.workspaceId ? eq(roles.workspaceId, payload.workspaceId) : undefined,
    );

    const [insertedRows, customerRoleRows] = await db.batch([
      db.insert(users).values({ ...payload, password: hashedPassword, fullName }).returning(),
      db.select().from(roles).where(customerRoleWhere).limit(1),
    ]);

    const newUser = insertedRows[0];
    const customerRole = customerRoleRows[0];

    if (customerRole) {
      await db.insert(userRoles).values({ userId: newUser.id, roleId: customerRole.id, workspaceId: payload.workspaceId });
    }

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  async sendOtp(c: AppContext, payload: { phoneNumber: string; workspaceId?: string; }) {
    const db = getDb(c);
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.phoneNumber, payload.phoneNumber), payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined))
      .limit(1);

    if (!existing) {
      await db.insert(users).values({
        id: ulid(),
        phoneNumber: payload.phoneNumber,
        workspaceId: payload.workspaceId,
        isActive: true,
      });
    }

    const otp = generateOTP();
    const otpSecret = (c.env.OTP_SECRET as string) || "local-otp-secret";
    const hash = await generateOtpHash(payload.phoneNumber, otp, otpSecret);
    const expiryInSec = parseInt((c.env.OTP_EXPIRY_SEC as string) || "300");
    const isProduction = c.env.MODE === "production";

    return { hash, expiryInSec, ...(!isProduction && { otp }) };
  }

  async verifyOtp(c: AppContext, payload: { phoneNumber: string; otp: number; hash: string; workspaceId?: string; }) {
    const db = getDb(c);
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.phoneNumber, payload.phoneNumber), payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined))
      .limit(1);

    if (!user) throw new BadRequestException("User not found");

    const otpSecret = (c.env.OTP_SECRET as string) || "local-otp-secret";
    const isValid = await verifyOtpHash(payload.phoneNumber, payload.otp, payload.hash, otpSecret);
    if (!isValid) throw new BadRequestException("Invalid or expired OTP");

    const { token, refreshToken, roles: roleNames } = await this.buildTokens(user.id, c);
    return { token, refreshToken, user: { id: user.id, roles: roleNames } };
  }

  async resetPassword(c: AppContext, payload: { email: string; workspaceId?: string; }) {
    const db = getDb(c);
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(and(eq(users.email, payload.email), payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined))
      .limit(1);

    if (!user) throw new NotFoundException("User not found");

    const otp = generateOTP();
    const otpSecret = (c.env.OTP_SECRET as string) || "local-otp-secret";
    const hash = await generateOtpHash(payload.email, otp, otpSecret);
    const isProduction = c.env.MODE === "production";

    return { email: payload.email, hash, ...(!isProduction && { otp }) };
  }

  async verifyResetPassword(c: AppContext, payload: { email: string; otp: number; newPassword: string; hash: string; workspaceId?: string; }) {
    const otpSecret = (c.env.OTP_SECRET as string) || "local-otp-secret";
    const isValid = await verifyOtpHash(payload.email, payload.otp, payload.hash, otpSecret);
    if (!isValid) throw new BadRequestException("Invalid OTP");

    const db = getDb(c);
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, payload.email), payload.workspaceId ? eq(users.workspaceId, payload.workspaceId) : undefined))
      .limit(1);

    if (!user) throw new NotFoundException("User not found");

    const hashed = await hashPassword(payload.newPassword);
    await db.update(users).set({ password: hashed, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));

    return { message: "Password reset successfully. Please login" };
  }

  async changePassword(c: AppContext, payload: { oldPassword: string; newPassword: string; }, authUserId: string) {
    const db = getDb(c);
    const [user] = await db.select().from(users).where(eq(users.id, authUserId)).limit(1);
    if (!user) throw new BadRequestException("User not found");

    const isMatch = await comparePassword(payload.oldPassword, user.password || "");
    if (!isMatch) throw new BadRequestException("Invalid old password");

    const hashed = await hashPassword(payload.newPassword);
    await db.update(users).set({ password: hashed, updatedAt: new Date().toISOString() }).where(eq(users.id, authUserId));

    return { message: "Password changed successfully" };
  }
}
