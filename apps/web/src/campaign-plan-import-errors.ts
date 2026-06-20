export class CampaignPlanImportError extends Error {
  code: string;
  statusCode: number;
  issues?: unknown[];

  constructor(code: string, message: string, statusCode = 400, issues?: unknown[]) {
    super(message);
    this.name = "CampaignPlanImportError";
    this.code = code;
    this.statusCode = statusCode;
    this.issues = issues;
  }
}
