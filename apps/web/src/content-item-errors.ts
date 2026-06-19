export class ContentItemError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "ContentItemError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
