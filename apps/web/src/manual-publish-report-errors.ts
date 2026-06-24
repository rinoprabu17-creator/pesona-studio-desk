export class ManualPublishReportError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "ManualPublishReportError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
