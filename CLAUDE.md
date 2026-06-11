# Wilt — AI Assistant Guide

## What this repo is

Wilt is a NestJS-like framework for Cloudflare Workers built on [Hono](https://hono.dev). It has three distinct parts:

| Part | Location | Purpose |
|---|---|---|
| **Framework core** | `src/wilt/` | Published as the `wilt` npm package — decorators, DI, middleware, utils |
| **Reference app** | `src/modules/`, `src/database/` | Auth + users example built with the framework; not published |
| **CLI** | `bin/` | `wilt new`, `wilt generate`, `wilt add` — project scaffolding |

## Development

```bash
pnpm install
pnpm db:migrate   # apply local D1 migrations
pnpm dev          # http://localhost:4001
```

`.dev.vars` is **not required**. `JWT_SECRET` and other secrets fall back to safe local defaults in `src/env.ts`. Only create `.dev.vars` if you need custom values for auth testing.

## Commands

```bash
pnpm dev          # start dev server (Vite + Cloudflare plugin)
pnpm build:lib    # build src/wilt/ → dist/lib/ via tsup (the npm package)
pnpm test         # run tests (Cloudflare Workers runtime via vitest-pool-workers)
pnpm check        # TypeScript type check, no emit
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Architecture

### Framework (src/wilt/)

- **decorators/core/** — `@Injectable`, `@Inject`, `@Optional`, `@SetMetadata`, `@UseGuards`, `@UseInterceptors`, `@Catch`, `@UseFilters`
- **decorators/http/** — `@Controller`, `@Get`/`@Post`/`@Put`/`@Delete`/`@Patch`, `@Body`/`@Param`/`@Query`/`@Headers`/`@Ip`/`@Req`, `@HttpCode`, `@Header`, `@Redirect`
- **decorators/modules/** — `@Module`, `@Global`
- **exceptions/** — `HttpException` + `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `UnprocessableEntityException`, `TooManyRequestsException`, `InternalServerErrorException`, and more
- **context/** — `ExecutionContext`, `ArgumentsHost` (used by guards, interceptors, filters)
- **interfaces/core/** — `CanActivate`, `NestInterceptor`, `CallHandler`, `ExceptionFilter`, `PipeTransform`, `OnModuleInit`, `OnModuleDestroy`
- **injector/** — `createModule`, `resolveInstance`, `collectModuleTree` (DI + module wiring + `@Global` support + lifecycle hooks)
- **middleware/** — `errorHandler` (recognizes `HttpException`), `requestLogger`
- **services/** — `Reflector` (reads `@SetMetadata` values from guards/interceptors)
- **utils/** — `ResponseUtil`, `Logger`, `forwardRef`, `applyDecorators`
- **pipes/** — `@ZodValidate`, `@QueryValidate`, `@Validate`

New decorators go in `src/wilt/decorators/` and must be exported from `src/wilt/index.ts`.

#### Request execution order
Incoming request → middleware → guards → interceptors (pre) → handler → interceptors (post) → exception filters (on throw)

#### Auto-serialization
When parameter decorators are used (`@Body`, `@Param`, etc.), handlers may return plain objects — Wilt calls `c.json(result)` automatically. Without parameter decorators, the handler receives the raw Hono `Context` as the first argument (backward-compatible).

### CLI (bin/)

- `bin/commands/` — one file per command (`new.ts`, `generate.ts`, `add.ts`)
- `bin/generators/` — code generation templates
- `bin/utils/` — path helpers, wrangler.jsonc writer, config reader
- `bin/wilt.ts` — entry point; wire new commands here and update the `HELP` string

### Generated project (wilt new)

The `runNew` function in `bin/commands/new.ts` scaffolds everything in a single pass — all file templates are inline string functions in that file. The generated project has no auth module; it starts with only a Hello module.

The generated `worker-configuration.d.ts` declares `CloudflareBindings` (the typed D1/KV/R2 interface) and extends `Cloudflare.Env` with `TEST_MIGRATIONS: string` so all test files can access the binding without re-declaring it.

## Key conventions

- TypeScript strict mode; no `any` unless unavoidable
- No comments explaining what the code does — only add one when the *why* is non-obvious
- No unnecessary abstractions; three similar lines beats a premature helper
- Tests run against a real Cloudflare Workers runtime — do not mock D1 or other bindings
- All public framework exports go through `src/wilt/index.ts`

## Testing

Tests use `@cloudflare/vitest-pool-workers` and run inside the Workers runtime. Integration tests hit a real local D1 instance. Do not mock the database.

Generated module tests (`wilt generate module`) include two layers:
- **Service unit test** — instantiates the service directly (`new ${Pascal}Service()`) and asserts it is defined.
- **HTTP integration tests** — hit the worker via `SELF.fetch` from `cloudflare:test`.

`TEST_MIGRATIONS` is declared in `worker-configuration.d.ts` (not in individual test files), making the binding available project-wide without per-file global augmentations.

```bash
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm test:coverage  # with coverage
```

## Building the npm package

```bash
pnpm build:lib
```

This runs `tsup` with the config in `tsup.config.ts` and outputs to `dist/lib/`. The `package.json` `exports` field points there.
