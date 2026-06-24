export class ManualPublishChecklistError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "ManualPublishChecklistError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
