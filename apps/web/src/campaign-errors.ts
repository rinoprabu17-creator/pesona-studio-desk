export type CampaignErrorCode =
  | "campaign_not_found"
  | "duplicate_campaign_code"
  | "invalid_campaign_code"
  | "invalid_campaign_name"
  | "invalid_start_date"
  | "invalid_end_date"
  | "invalid_campaign_period"
  | "invalid_target_audience"
  | "invalid_campaign_status"
  | "invalid_notes"
  | "product_not_found"
  | "inactive_product";

export class CampaignError extends Error {
  code: CampaignErrorCode;
  statusCode: number;

  constructor(code: CampaignErrorCode, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
