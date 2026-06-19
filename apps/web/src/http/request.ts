export type RequestLike = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  on(event: "data", listener: (chunk: Buffer) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
};

const maxBodyBytes = 1024 * 1024;

export function getHeader(request: RequestLike, name: string): string {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function getRequestUrl(request: RequestLike): URL {
  return new URL(request.url || "/", `http://${getHeader(request, "host") || "localhost"}`);
}

export function getPathname(url: URL): string {
  return url.pathname.replace(/\/+$/, "") || "/";
}

export function readBody(request: RequestLike): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error("Body terlalu besar."));
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

export async function readJsonBody(request: RequestLike): Promise<Record<string, unknown>> {
  const raw = await readBody(request);
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

export async function readFormBody(request: RequestLike): Promise<Record<string, string>> {
  const raw = await readBody(request);
  const params = new URLSearchParams(raw);
  const body: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    body[key] = value;
  }
  return body;
}
