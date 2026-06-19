export class ContentCalendarError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "ContentCalendarError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
