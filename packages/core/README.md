# @ajke/core

A lightweight, NestJS-inspired framework for building modular APIs on Cloudflare Workers using [Hono](https://hono.dev) as the HTTP layer.

## Installation

```bash
npm install @ajke/core hono reflect-metadata tsyringe zod
```

Your `tsconfig.json` must have:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## Quick Start

```typescript
// src/index.ts
import "reflect-metadata";
import { createModule } from "@ajke/core";
import { requestLogger } from "@ajke/core/middleware";
import { AppModule } from "./app.module";

const app = createModule(AppModule, {
  middlewares: [requestLogger],
});

export default {
  fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
```

```typescript
// src/app.module.ts
import { Module, createModule } from "@ajke/core";
import { HelloModule } from "./modules/hello/hello.module";

@Module({ imports: [HelloModule] })
export class AppModule {}
```

```typescript
// src/modules/hello/hello.module.ts
import { Module } from "@ajke/core";
import { HelloController } from "./hello.controller";
import { HelloService } from "./hello.service";

@Module({ controllers: [HelloController], providers: [HelloService] })
export class HelloModule {}
```

```typescript
// src/modules/hello/hello.controller.ts
import { Controller, Get, Inject } from "@ajke/core";
import { HelloService } from "./hello.service";

@Controller("/hello")
export class HelloController {
  constructor(@Inject(HelloService) private helloService: HelloService) {}

  @Get()
  greet() {
    return { message: this.helloService.greet() };
  }
}
```

```typescript
// src/modules/hello/hello.service.ts
import { Injectable } from "@ajke/core";

@Injectable()
export class HelloService {
  greet() {
    return "Hello from Ajke!";
  }
}
```

---

## Core Concepts

| Concept | Decorator / API | Purpose |
|---|---|---|
| Module | `@Module` | Group controllers and providers |
| Global Module | `@Global` | Make a module's providers available everywhere |
| Controller | `@Controller` | Handle HTTP routes |
| Provider | `@Injectable` | Injectable service |
| Custom injection | `@Inject` | Explicit token injection |
| Optional dep | `@Optional` | Inject `undefined` if provider not registered |
| Guards | `@UseGuards` | Authorization — block requests early |
| Interceptors | `@UseInterceptors` | Transform requests/responses |
| Exception filters | `@UseFilters` / `@Catch` | Handle specific thrown exceptions |
| Metadata | `@SetMetadata` + `Reflector` | Attach and read custom metadata |
| Lifecycle hooks | `OnModuleInit` | Run code after DI wiring |

---

## HTTP Decorators

### Route mapping

```typescript
@Get(path?)   @Post(path?)   @Put(path?)   @Delete(path?)   @Patch(path?)
```

### Parameter decorators

Extract values directly as handler arguments — no manual `c.req` parsing needed.

```typescript
@Body(property?)    // entire body, or body[property]
@Param(name?)       // route param :name, or all params as object
@Query(name?)       // query string ?name=, or all queries as object
@Headers(name?)     // single header, or all headers as object
@Ip()               // client IP (CF-Connecting-IP / X-Forwarded-For)
@Req()              // full Hono Context — escape hatch
```

### Response decorators

```typescript
@HttpCode(201)                         // override default 200/204
@Header('Cache-Control', 'no-store')   // set a response header
@Redirect('/new-url', 301)             // redirect response
```

---

## Validation

```typescript
import { ZodValidate, QueryValidate } from "@ajke/core";
import { z } from "zod";

const CreateUserDto = z.object({ name: z.string(), email: z.string().email() });

@Post()
@ZodValidate(CreateUserDto)       // validates body; result in c.get('validatedData')
async create(@Body() body: unknown) { ... }

@Get()
@QueryValidate(SearchDto)         // validates query params; result in c.get('validatedQuery')
async search() { ... }
```

---

## Guards

```typescript
import { Injectable, CanActivate, ExecutionContext, UseGuards } from "@ajke/core";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const c = context.switchToHttp().getRequest();
    return !!c.req.header("authorization");
  }
}

@Controller("/users")
@UseGuards(AuthGuard)
export class UsersController { ... }
```

A guard returning `false` causes Ajke to throw `ForbiddenException` automatically.

---

## Interceptors

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UseInterceptors } from "@ajke/core";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    const result = await next.handle();
    console.log(`Took ${Date.now() - start}ms`);
    return result;
  }
}

@Get()
@UseInterceptors(LoggingInterceptor)
async getAll() { ... }
```

---

## Exception Filters

```typescript
import { Catch, ExceptionFilter, ArgumentsHost, HttpException, UseFilters } from "@ajke/core";
import type { Context } from "hono";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): Response {
    const c = host.switchToHttp().getRequest<Context>();
    return c.json({ statusCode: exception.getStatus(), message: exception.getResponse() }, exception.getStatus() as any);
  }
}

@Controller("/users")
@UseFilters(HttpExceptionFilter)
export class UsersController { ... }
```

---

## Built-in Exceptions

Throw these anywhere — the built-in `errorHandler` middleware catches them automatically.

```typescript
throw new BadRequestException("Invalid input");
throw new UnauthorizedException();
throw new ForbiddenException("Insufficient permissions");
throw new NotFoundException("User not found");
throw new ConflictException("Email already exists");
throw new UnprocessableEntityException({ message: "Validation failed", errors: [] });
throw new TooManyRequestsException();
throw new InternalServerErrorException();
```

Extend `HttpException` for custom errors:

```typescript
export class PaymentRequiredException extends HttpException {
  constructor() { super("Payment required", 402); }
}
```

---

## SetMetadata + Reflector

```typescript
// Define a helper decorator
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);

// Use on a route
@Roles("admin")
@Get()
async adminOnly() { ... }

// Read in a guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;
    // check user roles...
    return true;
  }
}
```

---

## Lifecycle Hooks

```typescript
import { Injectable, OnModuleInit } from "@ajke/core";

@Injectable()
export class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    await this.connect();
  }
}
```

---

## Dependency Injection

```typescript
// Type-based (automatic)
constructor(private userService: UserService) {}

// Explicit token
constructor(@Inject(UserService) private userService: UserService) {}

// Circular references
constructor(@Inject(forwardRef(() => ServiceB)) private b: ServiceB) {}

// Optional
constructor(@Optional() private cache?: CacheService) {}
```

---

## Auto-Serialization

When parameter decorators (`@Body`, `@Param`, etc.) are used, handlers may return plain values:

| Return value | Response |
|---|---|
| Plain object / array | `c.json(result, 200)` |
| `undefined` / `null` | `204 No Content` |
| `Response` object | Returned as-is |

Without parameter decorators, the handler receives the raw Hono `Context` as the first argument (backward-compatible).

---

## Middleware

```typescript
import { requestLogger, errorHandler } from "@ajke/core/middleware";

const app = createModule(AppModule, {
  middlewares: [errorHandler, requestLogger],
});
```

---

## Config (`ajke.config.ts`)

```typescript
import { defineConfig } from "@ajke/core/config";

export default defineConfig({
  modulesDir: "src/modules/app",
  generate: {
    files: ["module", "controller", "service", "dto", "entity", "test"],
  },
});
```

---

## License

MIT
