import { loadLocalEnv } from "../scripts/env.mjs";
import { prepareTestDatabase } from "../scripts/prepare-test-db.mjs";

loadLocalEnv();

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL wajib diset untuk database-backed tests.");
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL tidak boleh sama dengan DATABASE_URL development.");
}

await prepareTestDatabase();

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.APP_ENV = "test";
