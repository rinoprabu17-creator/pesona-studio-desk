import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

function spawnEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env = { ...process.env, ...extra };
  delete env.PSD_ADMIN_USER;
  delete env.PSD_ADMIN_PASSWORD;
  delete env.OPERATIONAL_FOOTAGE_SOURCE_DIR;
  return { ...env, ...extra };
}

function composeConfig(envFile: string, env: NodeJS.ProcessEnv = spawnEnv()) {
  return spawnSync("docker", ["compose", "--env-file", envFile, "-f", "docker-compose.dev.yml", "config"], {
    cwd: process.cwd(),
    env,
    encoding: "utf8"
  });
}

function section(source: string, serviceName: string): string {
  const marker = `  ${serviceName}:`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${serviceName} section missing`);
  const rest = source.slice(start + marker.length);
  const next = rest.search(/\n  [a-zA-Z0-9_-]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}

test("docker compose dev config wires operational admin env to web-app only at runtime", () => {
  const dir = mkdtempSync(join(tmpdir(), "psd-compose-env-"));
  try {
    const envFile = join(dir, "compose.env");
    writeFileSync(
      envFile,
      [
        "PSD_ADMIN_USER=admin_test",
        "PSD_ADMIN_PASSWORD=not-a-real-password",
        "OPERATIONAL_FOOTAGE_SOURCE_DIR=/app/storage/footage-test",
        ""
      ].join("\n")
    );

    const result = composeConfig(envFile);
    assert.equal(result.status, 0, result.stderr);

    const webApp = section(result.stdout, "web-app");
    const videoWorker = section(result.stdout, "video-worker");
    const mockupWorker = section(result.stdout, "mockup-worker");

    assert.match(webApp, /PSD_ADMIN_USER:\s*admin_test/);
    assert.match(webApp, /PSD_ADMIN_PASSWORD:\s*not-a-real-password/);
    assert.match(webApp, /OPERATIONAL_FOOTAGE_SOURCE_DIR:\s*\/app\/storage\/footage-test/);
    assert.match(videoWorker, /OPERATIONAL_FOOTAGE_SOURCE_DIR:\s*\/app\/storage\/footage-test/);
    assert.doesNotMatch(videoWorker, /PSD_ADMIN_USER|PSD_ADMIN_PASSWORD/);
    assert.doesNotMatch(mockupWorker, /PSD_ADMIN_USER|PSD_ADMIN_PASSWORD|OPERATIONAL_FOOTAGE_SOURCE_DIR/);

    const webDockerfile = readFileSync("apps/web/Dockerfile", "utf8");
    assert.doesNotMatch(webDockerfile, /PSD_ADMIN_USER|PSD_ADMIN_PASSWORD|not-a-real-password/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("docker compose dev config fails clearly when admin auth env is missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "psd-compose-env-missing-"));
  try {
    const envFile = join(dir, "compose.env");
    writeFileSync(envFile, "OPERATIONAL_FOOTAGE_SOURCE_DIR=/app/storage/footage-test\n");

    const result = composeConfig(envFile, spawnEnv({}));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /PSD_ADMIN_USER is required for web-app admin auth|PSD_ADMIN_USER/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
