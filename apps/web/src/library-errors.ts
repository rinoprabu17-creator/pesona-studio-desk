export type LibraryErrorCode =
  | "bad_request"
  | "duplicate_code"
  | "invalid_hex"
  | "invalid_school_level"
  | "invalid_uuid"
  | "not_found"
  | "color_in_use"
  | "inactive_color";

export class LibraryError extends Error {
  code: LibraryErrorCode;
  statusCode: number;

  constructor(code: LibraryErrorCode, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
