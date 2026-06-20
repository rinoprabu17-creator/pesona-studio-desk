import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ProviderBatchResultSchema } from "./schema.ts";
import { CampaignPlannerProviderError } from "./provider.ts";
import { buildOpenAIPrompt, OpenAIProviderBatchOutputSchema } from "./openai-prompt.ts";
import { resolveOpenAISecret } from "./openai-config.ts";
import type { CampaignPlannerProvider, CampaignPlannerProviderBatchInput } from "./provider.ts";
import type { ProviderBatchResult } from "./types.ts";

export type OpenAIResponsesClient = {
  responses: {
    parse(request: Record<string, unknown>): Promise<any>;
  };
};

export type OpenAICampaignPlannerProviderOptions = {
  model: string;
  promptVersion: string;
  maxOutputTokens: number;
  timeoutMs: number;
  client?: OpenAIResponsesClient;
};

export function createOpenAIResponsesClient(options: { apiKey?: string; timeoutMs: number }): OpenAIResponsesClient {
  const apiKey = options.apiKey || resolveOpenAISecret().apiKey;
  return new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: options.timeoutMs
  }) as unknown as OpenAIResponsesClient;
}

export class OpenAICampaignPlannerProvider implements CampaignPlannerProvider {
  providerName = "openai";
  readonly model: string;
  readonly promptVersion: string;
  readonly maxOutputTokens: number;
  readonly timeoutMs: number;
  private readonly client: OpenAIResponsesClient;

  constructor(options: OpenAICampaignPlannerProviderOptions) {
    this.model = options.model;
    this.promptVersion = options.promptVersion;
    this.maxOutputTokens = options.maxOutputTokens;
    this.timeoutMs = options.timeoutMs;
    this.client = options.client || createOpenAIResponsesClient({ timeoutMs: options.timeoutMs });
  }

  async generateBatch(input: CampaignPlannerProviderBatchInput): Promise<ProviderBatchResult> {
    const prompt = buildOpenAIPrompt(input, this.promptVersion);
    const request = {
      model: this.model,
      instructions: prompt.instructions,
      input: prompt.input,
      text: {
        format: zodTextFormat(OpenAIProviderBatchOutputSchema, "campaign_planner_batch")
      },
      store: false,
      background: false,
      max_output_tokens: this.maxOutputTokens
    };

    let response: any;
    try {
      response = await this.client.responses.parse(request);
    } catch (error) {
      throw classifyOpenAIError(error);
    }

    assertNoRefusal(response);
    assertCompleteResponse(response);

    const parsedOutput = response.output_parsed;
    if (!parsedOutput) {
      throw new CampaignPlannerProviderError("invalid_structured_output", "Provider menghasilkan output terstruktur tidak valid.", {
        retryable: false
      });
    }
    const structuredOutput = parseStructuredOutput(parsedOutput);

    const result = {
      provider_name: this.providerName,
      model_name: this.model,
      response_id: typeof response.id === "string" ? response.id : null,
      usage: mapUsage(response.usage),
      items: structuredOutput.items
    };

    try {
      return ProviderBatchResultSchema.parse(result);
    } catch {
      throw new CampaignPlannerProviderError("invalid_structured_output", "Provider menghasilkan output terstruktur tidak valid.", {
        retryable: false
      });
    }
  }
}

function parseStructuredOutput(output: unknown): { items: ProviderBatchResult["items"] } {
  try {
    return OpenAIProviderBatchOutputSchema.parse(output);
  } catch {
    throw new CampaignPlannerProviderError("invalid_structured_output", "Provider menghasilkan output terstruktur tidak valid.", {
      retryable: false
    });
  }
}

function mapUsage(usage: any): ProviderBatchResult["usage"] {
  if (!usage) return null;
  return {
    input_tokens: typeof usage.input_tokens === "number" ? usage.input_tokens : null,
    output_tokens: typeof usage.output_tokens === "number" ? usage.output_tokens : null,
    total_tokens: typeof usage.total_tokens === "number" ? usage.total_tokens : null
  };
}

function assertNoRefusal(response: any): void {
  const hasRefusal = Array.isArray(response?.output)
    ? response.output.some((item: any) =>
        Array.isArray(item?.content) &&
        item.content.some((content: any) => content?.type === "refusal" || typeof content?.refusal === "string")
      )
    : false;
  if (hasRefusal) {
    throw new CampaignPlannerProviderError("model_refusal", "Model menolak membuat draft.", { retryable: false });
  }
}

function assertCompleteResponse(response: any): void {
  if (response?.status === "incomplete" || response?.incomplete_details) {
    throw new CampaignPlannerProviderError("incomplete_model_response", "Respons model tidak lengkap.", { retryable: false });
  }
}

export function classifyOpenAIError(error: any): CampaignPlannerProviderError {
  if (error instanceof CampaignPlannerProviderError) return error;

  const status = Number(error?.status || error?.code || 0);
  const errorCode = typeof error?.code === "string" ? error.code : "";
  const message = safeProviderMessage(error?.message);

  if (error?.name === "APIConnectionTimeoutError" || errorCode === "ETIMEDOUT" || /timeout/i.test(String(error?.message || ""))) {
    return new CampaignPlannerProviderError("provider_timeout", "Provider timeout.", { retryable: true });
  }
  if (error?.name === "APIConnectionError" || errorCode === "ECONNRESET" || errorCode === "ENOTFOUND") {
    return new CampaignPlannerProviderError("provider_network_error", "Koneksi provider gagal.", { retryable: true });
  }
  if (status === 429) {
    return new CampaignPlannerProviderError("provider_rate_limited", "Provider sedang rate limited.", { retryable: true });
  }
  if (status === 408 || status === 409 || status >= 500) {
    return new CampaignPlannerProviderError("provider_temporarily_unavailable", "Provider sementara tidak tersedia.", {
      retryable: true
    });
  }
  if (status === 401 || status === 403) {
    return new CampaignPlannerProviderError("provider_authentication_failed", "Konfigurasi OpenAI belum tersedia.", {
      retryable: false
    });
  }
  if (status === 404) {
    return new CampaignPlannerProviderError("provider_model_unavailable", "Model OpenAI tidak tersedia.", { retryable: false });
  }
  if (status === 400 || status === 422) {
    return new CampaignPlannerProviderError("provider_request_invalid", "Request provider tidak valid.", { retryable: false });
  }

  return new CampaignPlannerProviderError("provider_network_error", message || "Koneksi provider gagal.", { retryable: true });
}

function safeProviderMessage(message: unknown): string {
  return String(message || "")
    .replace(/sk-[A-Za-z0-9_-]+/g, "[api-key]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/postgresql:\/\/\S+/gi, "[database-url]")
    .slice(0, 300);
}
