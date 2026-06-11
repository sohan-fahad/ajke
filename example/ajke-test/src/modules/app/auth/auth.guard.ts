import { Injectable, UnauthorizedException } from "@ajke/core";
import type { CanActivate, ExecutionContext } from "@ajke/core";
import { extractBearerToken, verifyToken } from "./jwt.helper";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const c = context.switchToHttp().getRequest();
    const authorization = c.req.header("authorization");
    const token = extractBearerToken(authorization);

    if (!token) {
      throw new UnauthorizedException("Unauthorized Access Detected");
    }

    try {
      const payload = await verifyToken(token, c.env.JWT_SECRET || "local-dev-secret-change-in-production");

      if (!payload?.user?.id) {
        throw new UnauthorizedException("Unauthorized Access Detected");
      }

      c.set("authUser", payload.user);
      c.set("authPermissions", payload.permissions || []);
      return true;
    } catch {
      throw new UnauthorizedException("Unauthorized Access Detected");
    }
  }
}
