import {
  CampaignPlannerProviderError,
  FakeCampaignPlannerProvider,
  OpenAICampaignPlannerProvider
} from "../../../packages/campaign-planner/src/index.ts";
import type { CampaignPlannerProvider } from "../../../packages/campaign-planner/src/index.ts";
import type { CampaignPlannerWorkerConfig } from "./lease.ts";

export type ProviderFactoryContext = {
  provider: string;
  model: string;
  promptVersion: string;
  fakeMode: string;
};

export function createProviderForRun(context: ProviderFactoryContext, config: CampaignPlannerWorkerConfig): CampaignPlannerProvider {
  if (config.providerFactory) {
    return config.providerFactory(context) as CampaignPlannerProvider;
  }

  if (context.provider === "fake") {
    return new FakeCampaignPlannerProvider({ mode: context.fakeMode as any });
  }

  if (context.provider === "openai") {
    if (!config.openaiEnabled) {
      throw new CampaignPlannerProviderError(
        "campaign_planner_provider_unavailable",
        "Konfigurasi OpenAI belum tersedia.",
        { retryable: false }
      );
    }
    return new OpenAICampaignPlannerProvider({
      model: context.model,
      promptVersion: context.promptVersion,
      maxOutputTokens: config.openaiMaxOutputTokens,
      timeoutMs: config.openaiTimeoutMs
    });
  }

  throw new CampaignPlannerProviderError("campaign_planner_provider_unavailable", "Provider Campaign Planner tidak tersedia.", {
    retryable: false
  });
}
