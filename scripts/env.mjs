import { existsSync, readFileSync } from "node:fs";

export function loadLocalEnv() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const envPath = ".env.local";
  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, "utf8");
  const parsed = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key) {
      parsed[key] = value;
    }
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] !== undefined) {
      continue;
    }

    if (key === "DATABASE_URL" && value.includes("@postgres:")) {
      const exposedPort = parsed.POSTGRES_EXPOSED_PORT || "5432";
      process.env[key] = value.replace("@postgres:5432", `@localhost:${exposedPort}`);
      continue;
    }

    process.env[key] = value;
  }
}
