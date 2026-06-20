import type { ValidationIssue } from "../../../packages/campaign-planner/src/index.ts";

export class CampaignPlanReviewError extends Error {
  code: string;
  statusCode: number;
  issues?: ValidationIssue[];

  constructor(code: string, message: string, statusCode = 400, issues?: ValidationIssue[]) {
    super(message);
    this.name = "CampaignPlanReviewError";
    this.code = code;
    this.statusCode = statusCode;
    this.issues = issues;
  }
}
