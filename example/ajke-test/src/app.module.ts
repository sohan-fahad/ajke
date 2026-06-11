import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import { Module, createModule } from "@ajke/core";
import { requestLogger, errorHandler } from "@ajke/core/middleware";

import { QueueModule } from "./modules/queues/queue.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

import { AuthModule } from "./modules/app/auth/auth.module";
import { UserModule } from "./modules/app/user/user.module";
import { AclModule } from "./modules/app/acl/acl.module";
import { OrganizationModule } from "./modules/app/organizations/organization.module";
import { CatalogsModule } from "./modules/app/catalogs/catalogs.module";
import { LocationsModule } from "./modules/app/locations/locations.module";
import { ProductsModule } from "./modules/app/products/products.module";
import { OffersModule } from "./modules/app/offers/offers.module";
import { PaymentsModule } from "./modules/app/payments/payments.module";
import { CartsModule } from "./modules/app/carts/carts.module";
import { OrdersModule } from "./modules/app/orders/orders.module";
import { TransactionsModule } from "./modules/app/transactions/transactions.module";
import { DeliveryManModule } from "./modules/app/deliveryman/deliveryman.module";
import { GalleriesModule } from "./modules/app/galleries/galleries.module";
import { BusinessModule } from "./modules/app/business/business.module";
import { CmsModule } from "./modules/app/cms/cms.module";
import { CommonsModule } from "./modules/app/commons/commons.module";

@Module({
  imports: [
    QueueModule,
    NotificationsModule,
    AuthModule,
    UserModule,
    AclModule,
    OrganizationModule,
    CatalogsModule,
    LocationsModule,
    ProductsModule,
    OffersModule,
    PaymentsModule,
    CartsModule,
    OrdersModule,
    TransactionsModule,
    DeliveryManModule,
    GalleriesModule,
    BusinessModule,
    CmsModule,
    CommonsModule,
  ],
})
export class AppModule { }

const app = createModule(AppModule, {
  middlewares: [cors(), secureHeaders(), errorHandler, requestLogger],
});

app.get("/", (c) => c.json({ success: true, status: "healthy", timestamp: new Date().toISOString() }));
app.get("/health", (c) => c.json({ success: true, status: "healthy", timestamp: new Date().toISOString() }));

app.onError((err, c) => {
  // Duck-type check for HttpException (avoids instanceof failure across bundler chunks)
  if (typeof (err as any).getStatus === "function" && typeof (err as any).getResponse === "function") {
    const response = (err as any).getResponse();
    const body =
      typeof response === "string"
        ? { success: false, error: { code: err.name, message: response }, timestamp: new Date().toISOString() }
        : { success: false, ...response, timestamp: new Date().toISOString() };
    return c.json(body, (err as any).getStatus());
  }

  // Zod validation errors → 400
  if (err.name === "ZodError" && Array.isArray((err as any).issues)) {
    const details = (err as any).issues.map((i: any) => ({
      field: (i.path as (string | number)[]).join("."),
      message: i.message as string,
      code: i.code as string,
    }));
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", details }, timestamp: new Date().toISOString() },
      400,
    );
  }

  return c.json({ success: false, error: { code: err.name ?? "INTERNAL_ERROR", message: err.message ?? "Internal server error" }, timestamp: new Date().toISOString() }, 500);
});

export { app };
