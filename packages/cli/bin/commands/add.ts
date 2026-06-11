import {
  addD1,
  addR2,
  addKv,
  addQueue,
  addAi,
  addDurableObject,
  addVectorize,
  addBrowser,
  addHyperdrive,
  addVar,
} from "../utils/wrangler.js";

const USAGE = `
Usage:
  pnpm ajke add var <NAME> [value]
  pnpm ajke add d1 <BINDING_NAME> <database-name>
  pnpm ajke add r2 <BINDING_NAME> <bucket-name>
  pnpm ajke add kv <BINDING_NAME>
  pnpm ajke add queue <BINDING_NAME> <queue-name>
  pnpm ajke add ai <BINDING_NAME>
  pnpm ajke add durable-object <BINDING_NAME> <ClassName>
  pnpm ajke add vectorize <BINDING_NAME> <index-name> [dimensions]
  pnpm ajke add browser <BINDING_NAME>
  pnpm ajke add hyperdrive <BINDING_NAME> <connection-string>

Examples:
  pnpm ajke add var JWT_SECRET
  pnpm ajke add var MODE development
  pnpm ajke add d1 PAYMENTS_DB payments-db
  pnpm ajke add r2 ASSETS_BUCKET my-assets
  pnpm ajke add kv SESSION_KV
  pnpm ajke add queue MAIL_QUEUE mailer
  pnpm ajke add ai AI
  pnpm ajke add durable-object CHAT_ROOM ChatRoom
  pnpm ajke add vectorize VECTOR_IDX my-index 1536
  pnpm ajke add browser BROWSER
  pnpm ajke add hyperdrive HYPERDRIVE postgres://user:pass@host/db
`.trim();

export function runAdd(args: string[]): void {
  const [service, ...rest] = args;

  if (!service) {
    console.error(`  ✗ Missing service type.\n\n${USAGE}`);
    process.exit(1);
  }

  const svc = service.toLowerCase();

  switch (svc) {
    case "var": {
      const [name, value] = rest;
      if (!name) {
        console.error(`  ✗ Usage: pnpm ajke add var <NAME> [value]`);
        process.exit(1);
      }
      console.log(`\n  Adding var to wrangler.jsonc...\n`);
      addVar(name, value);
      break;
    }

    case "d1": {
      const [binding, dbName] = rest;
      if (!binding || !dbName) {
        console.error(`  ✗ Usage: pnpm ajke add d1 <BINDING_NAME> <database-name>`);
        process.exit(1);
      }
      console.log(`\n  Adding D1 binding to wrangler.jsonc...\n`);
      addD1(binding, dbName);
      break;
    }

    case "r2": {
      const [binding, bucketName] = rest;
      if (!binding || !bucketName) {
        console.error(`  ✗ Usage: pnpm ajke add r2 <BINDING_NAME> <bucket-name>`);
        process.exit(1);
      }
      console.log(`\n  Adding R2 binding to wrangler.jsonc...\n`);
      addR2(binding, bucketName);
      break;
    }

    case "kv": {
      const [binding] = rest;
      if (!binding) {
        console.error(`  ✗ Usage: pnpm ajke add kv <BINDING_NAME>`);
        process.exit(1);
      }
      console.log(`\n  Adding KV namespace binding to wrangler.jsonc...\n`);
      addKv(binding);
      break;
    }

    case "queue": {
      const [binding, queueName] = rest;
      if (!binding || !queueName) {
        console.error(`  ✗ Usage: pnpm ajke add queue <BINDING_NAME> <queue-name>`);
        process.exit(1);
      }
      console.log(`\n  Adding Queue binding to wrangler.jsonc...\n`);
      addQueue(binding, queueName);
      break;
    }

    case "ai": {
      const [binding] = rest;
      if (!binding) {
        console.error(`  ✗ Usage: pnpm ajke add ai <BINDING_NAME>`);
        process.exit(1);
      }
      console.log(`\n  Adding AI binding to wrangler.jsonc...\n`);
      addAi(binding);
      break;
    }

    case "durable-object":
    case "do": {
      const [binding, className] = rest;
      if (!binding || !className) {
        console.error(`  ✗ Usage: pnpm ajke add durable-object <BINDING_NAME> <ClassName>`);
        process.exit(1);
      }
      console.log(`\n  Adding Durable Object binding to wrangler.jsonc...\n`);
      addDurableObject(binding, className);
      break;
    }

    case "vectorize":
    case "vector": {
      const [binding, indexName, rawDimensions] = rest;
      if (!binding || !indexName) {
        console.error(`  ✗ Usage: pnpm ajke add vectorize <BINDING_NAME> <index-name> [dimensions]`);
        process.exit(1);
      }
      const dimensions = rawDimensions ? parseInt(rawDimensions, 10) : 1536;
      console.log(`\n  Adding Vectorize binding to wrangler.jsonc...\n`);
      addVectorize(binding, indexName, dimensions);
      break;
    }

    case "browser": {
      const [binding] = rest;
      if (!binding) {
        console.error(`  ✗ Usage: pnpm ajke add browser <BINDING_NAME>`);
        process.exit(1);
      }
      console.log(`\n  Adding Browser rendering binding to wrangler.jsonc...\n`);
      addBrowser(binding);
      break;
    }

    case "hyperdrive": {
      const [binding, connectionString] = rest;
      if (!binding || !connectionString) {
        console.error(`  ✗ Usage: pnpm ajke add hyperdrive <BINDING_NAME> <connection-string>`);
        process.exit(1);
      }
      console.log(`\n  Adding Hyperdrive binding to wrangler.jsonc...\n`);
      addHyperdrive(binding, connectionString);
      break;
    }

    default: {
      console.error(`  ✗ Unknown service type: "${service}"\n\n${USAGE}`);
      process.exit(1);
    }
  }
}
