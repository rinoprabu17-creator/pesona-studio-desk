import { existsSync, readFileSync } from "node:fs";
import { contentEnginePromptVersion } from "./registry.ts";
import type { ContentEngineProviderName, ContentEngineRuntimeConfig } from "./types.ts";

function booleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(`invalid_${name.toLowerCase()}`);
}

function requestedProvider(): ContentEngineProviderName {
  const raw = process.env.AI_PROVIDER || "fake";
  if (raw === "fake" || raw === "openai") return raw;
  throw new Error("content_engine_provider_unavailable");
}

function hasOpenAISecret(): boolean {
  const filePath = process.env.OPENAI_API_KEY_FILE;
  if (filePath) {
    if (!existsSync(filePath)) return false;
    return Boolean(readFileSync(filePath, "utf8").trim());
  }
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function loadContentEngineRuntimeConfig(): ContentEngineRuntimeConfig {
  const provider = requestedProvider();
  const liveEnabled = booleanEnv("AI_LIVE_ENABLED", false);
  const openaiModel = process.env.OPENAI_MODEL?.trim() || null;
  const openaiSecretAvailable = hasOpenAISecret();

  if (provider === "openai" && (!liveEnabled || !openaiModel || !openaiSecretAvailable)) {
    return {
      provider: "fake",
      liveEnabled,
      promptVersion: process.env.AI_CONTENT_ENGINE_PROMPT_VERSION || contentEnginePromptVersion,
      openaiModel,
      openaiSecretAvailable,
      fallbackReason: "openai_requested_without_complete_live_env"
    };
  }

  return {
    provider,
    liveEnabled,
    promptVersion: process.env.AI_CONTENT_ENGINE_PROMPT_VERSION || contentEnginePromptVersion,
    openaiModel,
    openaiSecretAvailable,
    fallbackReason: null
  };
}
