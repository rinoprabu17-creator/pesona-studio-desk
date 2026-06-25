export class OperationalReadinessError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly issues?: unknown[];

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    issues?: unknown[]
  ) {
    super(message);
    this.name = "OperationalReadinessError";
    this.code = code;
    this.statusCode = statusCode;
    this.issues = issues;
  }
}
