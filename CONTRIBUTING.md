# Contributing to Wilt

Thanks for your interest in contributing! This guide covers everything you need to get started.

## What is Wilt?

Wilt has two parts that live in this repo:

| Part | Location | Purpose |
|---|---|---|
| **Framework** | `src/wilt/` | The library — decorators, DI, middleware. Published as the `wilt` npm package. |
| **Starter app** | `src/modules/`, `src/database/` | A reference implementation showing auth + users built with the framework. |
| **CLI** | `bin/` | `wilt new`, `wilt generate`, `wilt add` — scaffolding commands. |

If you're fixing a decorator bug → work in `src/wilt/`.  
If you're adding a CLI command → work in `bin/`.  
If you're improving the starter example → work in `src/modules/`.

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A Cloudflare account (only needed for deploying, not local dev)

## Local setup

```bash
git clone https://github.com/your-org/wilt.git
cd wilt
pnpm install

# Apply local D1 migrations
pnpm db:migrate

# Start dev server on http://localhost:4001
pnpm dev
```


Test that it works:
```bash
curl http://localhost:4001/health
```

## Running tests

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
pnpm test:coverage # with coverage report
```

Tests run inside a real Cloudflare Workers runtime via `@cloudflare/vitest-pool-workers`. Do not mock the D1 database — integration tests must hit the real local instance.

Generated module tests include two layers: a service unit test (`should be defined`) and HTTP integration tests against the worker via `SELF.fetch`. The `TEST_MIGRATIONS` binding is declared in `worker-configuration.d.ts` (not in individual test files) so it's available globally across all tests.

## Building the library

```bash
pnpm build:lib   # builds src/wilt/ → dist/lib/ via tsup
pnpm check       # TypeScript type check (no emit)
```

## Project structure

```
bin/                     # CLI source (wilt new / generate / add)
  commands/              # One file per top-level command
  generators/            # Code generation templates
  utils/                 # Path helpers, wrangler.jsonc writer
src/
  wilt/                  # Framework core — the library
    decorators/          # @Controller, @Module, @Get, @ZodValidate, @RequireAuth …
    di/                  # Module factory + DI resolver
    middleware/          # errorHandler, requestLogger
    utils/               # logger, ResponseUtil
  modules/               # Reference app built on the framework
    app/auth/            # Auth module (login, register, OTP, JWT)
    app/user/            # User module
    shared/helpers/      # JWT, bcrypt, utils
  database/              # Drizzle + D1 setup
  openapi/               # Static OpenAPI doc
migrations/              # D1 SQL migrations
worker-configuration.d.ts  # Cloudflare binding types; declares TEST_MIGRATIONS for test env
```

## Making changes

### Adding a decorator

All decorators live in `src/wilt/decorators/`. Export new decorators from `src/wilt/index.ts` so they appear in the public API.

### Adding a CLI command

1. Create `bin/commands/<name>.ts` with a `run<Name>(args: string[])` export.
2. Import and wire it in `bin/wilt.ts`.
3. Add usage info to the `HELP` string in `bin/wilt.ts`.

### Adding a Cloudflare binding type to `wilt add`

1. Add the writer function in `bin/utils/wrangler.ts`.
2. Add the case in `bin/commands/add.ts`.

## Code style

- **TypeScript strict mode** — no `any` unless unavoidable.
- **No comments explaining what the code does** — only add a comment when the *why* is non-obvious.
- **No unnecessary abstractions** — three similar lines beats a premature helper.
- Run `pnpm format` before committing (`prettier` is configured).
- Run `pnpm lint` to check ESLint rules.

## Submitting a pull request

1. Fork the repo and create a branch: `git checkout -b feat/my-thing`
2. Make your changes and add tests if relevant.
3. Run `pnpm test` and `pnpm check` — both must pass.
4. Open a PR against `main` with a clear title and description of *why* the change is needed.

## Reporting bugs

Open a GitHub issue with:
- What you did
- What you expected
- What actually happened
- Minimal reproduction (a few lines of code or a repo link)

## Questions

Open a GitHub Discussion — not an issue.
