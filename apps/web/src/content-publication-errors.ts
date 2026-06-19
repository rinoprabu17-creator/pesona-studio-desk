export class ContentPublicationError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "ContentPublicationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
