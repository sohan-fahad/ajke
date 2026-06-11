# @ajke/cli

The official CLI for the [Ajke framework](../core/README.md). Scaffold new Cloudflare Workers projects and generate modules, services, and controllers.

## Installation

```bash
npm install -g @ajke/cli
```

Or run without installing:

```bash
npx @ajke/cli new my-app
```

---

## Commands

### `ajke new <project-name>`

Scaffold a new Ajke project with a Hello module, D1 database setup, and all config files pre-configured.

```bash
ajke new my-app
cd my-app
pnpm dev   # http://localhost:4001
```

**What gets created:**

```
my-app/
├── src/
│   ├── index.ts
│   ├── app.module.ts
│   └── modules/app/hello/
│       ├── hello.module.ts
│       ├── hello.controller.ts
│       └── hello.service.ts
├── src/database/
│   ├── schema.ts
│   └── connection.ts
├── migrations/
├── ajke.config.ts
├── wrangler.jsonc
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

---

### `ajke generate <subcommand> <name>`

Aliases: `g`

Scaffold files inside an existing project. Reads `ajke.config.ts` for the modules directory.

#### `ajke generate module <name>` (alias: `g m`)

Generates a full module: module, controller, service, DTO, entity, and test file.

```bash
ajke generate module payment
ajke g m payment
ajke g m payment --no-test    # skip test file
ajke g m payment --path src/modules/billing/payment
```

**Output:**

```
src/modules/app/payment/
├── payment.module.ts
├── payment.controller.ts
├── payment.service.ts
├── payment.dto.ts
├── payment.entity.ts
└── payment.test.ts
```

#### `ajke generate service <name>` (alias: `g s`)

```bash
ajke generate service payment
ajke g s payment --path src/modules/app/payment
```

#### `ajke generate controller <name>` (alias: `g c`)

```bash
ajke generate controller payment
ajke g c payment --path src/modules/app/payment
```

---

### `ajke add <service> [args]`

Add a Cloudflare service binding to `wrangler.jsonc`.

| Subcommand | Usage | Example |
|---|---|---|
| `d1` | `ajke add d1 <BINDING> <db-name>` | `ajke add d1 DB my-database` |
| `r2` | `ajke add r2 <BINDING> <bucket-name>` | `ajke add r2 ASSETS my-bucket` |
| `kv` | `ajke add kv <BINDING>` | `ajke add kv SESSION_KV` |
| `queue` | `ajke add queue <BINDING> <queue-name>` | `ajke add queue MAIL mail-queue` |
| `ai` | `ajke add ai <BINDING>` | `ajke add ai AI` |
| `durable-object` | `ajke add durable-object <BINDING> <ClassName>` | `ajke add durable-object CHAT ChatRoom` |
| `vectorize` | `ajke add vectorize <BINDING> <index-name> [dims]` | `ajke add vectorize VEC my-index 1536` |
| `browser` | `ajke add browser <BINDING>` | `ajke add browser BROWSER` |
| `hyperdrive` | `ajke add hyperdrive <BINDING> <connection-string>` | `ajke add hyperdrive HD postgres://...` |

---

## Config (`ajke.config.ts`)

Place this file in your project root to customise the CLI behaviour.

```typescript
import { defineConfig } from "@ajke/core/config";

export default defineConfig({
  // Where generated modules are placed (relative to project root)
  modulesDir: "src/modules/app",

  // Which files are scaffolded by `ajke generate module <name>`
  // Remove "test" to skip test files, or pass --no-test per-command
  generate: {
    files: ["module", "controller", "service", "dto", "entity", "test"],
  },
});
```

---

## Usage Inside a Project

When `@ajke/cli` is installed locally as a dev dependency, add a script to `package.json`:

```json
{
  "scripts": {
    "ajke": "tsx node_modules/@ajke/cli/bin/ajke.ts"
  }
}
```

Then run:

```bash
pnpm ajke generate module posts
pnpm ajke add d1 DB my-database
```

---

## License

MIT
