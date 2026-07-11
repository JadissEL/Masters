/**
 * Database module stub.
 *
 * The application now uses a pure-JavaScript JSON data store
 * (`src/lib/data-store.ts`) to avoid native `better-sqlite3`
 * compilation requirements. This file is kept as a no-op shim so
 * that any lingering imports do not break the build. The Drizzle
 * schema is still re-exported for reference/tooling.
 */
export * as schema from "./schema";