import type { ContentEngineSmokeInput, ContentEngineSmokeResult } from "./types.ts";

export class ContentEngineProviderError extends Error {
  code: string;
  retryable: boolean;

  constructor(code: string, message: string, options: { retryable?: boolean } = {}) {
    super(message);
    this.name = "ContentEngineProviderError";
    this.code = code;
    this.retryable = Boolean(options.retryable);
  }
}

export interface ContentEngineProvider {
  providerName: string;
  modelName: string;
  generateSmoke(input: ContentEngineSmokeInput): Promise<ContentEngineSmokeResult>;
}
