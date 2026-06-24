export class ManualPublishCloseoutError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "ManualPublishCloseoutError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
