export class ManualPublicationPackageError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "ManualPublicationPackageError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
