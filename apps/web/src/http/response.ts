import { LibraryError } from "../library-errors.ts";

export type ResponseLike = {
  writeHead(statusCode: number, headers?: Record<string, string>): void;
  end(body?: string): void;
};

export function sendJson(response: ResponseLike, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

export function sendSuccess(response: ResponseLike, data: unknown, statusCode = 200): void {
  sendJson(response, statusCode, { ok: true, data });
}

export function sendError(response: ResponseLike, statusCode: number, code: string, message: string): void {
  sendJson(response, statusCode, {
    ok: false,
    error: {
      code,
      message
    }
  });
}

export function redirect(response: ResponseLike, location: string): void {
  response.writeHead(303, { Location: location });
  response.end();
}

export function sendHtml(response: ResponseLike, html: string, statusCode = 200): void {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(html);
}

export function handleApiError(response: ResponseLike, error: unknown): void {
  if (error instanceof LibraryError) {
    sendError(response, error.statusCode, error.code, error.message);
    return;
  }

  if (
    error instanceof Error &&
    "statusCode" in error &&
    "code" in error &&
    typeof (error as any).statusCode === "number" &&
    typeof (error as any).code === "string"
  ) {
    sendError(response, (error as any).statusCode, (error as any).code, error.message);
    return;
  }

  const message = error instanceof SyntaxError ? "Body JSON tidak valid." : "Terjadi error pada server.";
  sendError(response, error instanceof SyntaxError ? 400 : 500, error instanceof SyntaxError ? "invalid_json" : "server_error", message);
}
