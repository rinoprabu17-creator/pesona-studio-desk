import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { checkDatabase } from "./db.ts";
import {
  activateColor,
  createColor,
  deactivateColor,
  getColor,
  LibraryError,
  listColors,
  listOffers,
  listPainPoints,
  listProducts,
  listSchoolLevelColorDefaults,
  schoolLevels,
  updateColor,
  upsertSchoolLevelColorDefault
} from "./library-service.ts";

type RequestLike = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  on(event: "data", listener: (chunk: Buffer) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
};

type ResponseLike = {
  writeHead(statusCode: number, headers?: Record<string, string>): void;
  end(body?: string): void;
};

type NavItem = {
  href: string;
  label: string;
};

const appName = process.env.APP_NAME || "Pesona Studio Desk";
const port = Number(process.env.APP_PORT || process.env.PORT || "3000");
const storageDir = process.env.APP_STORAGE_DIR || join(process.cwd(), "storage");

const navItems: NavItem[] = [
  { href: "/products", label: "Product Library" },
  { href: "/colors", label: "Color Library" },
  { href: "/school-level-color-defaults", label: "Rekomendasi Warna" },
  { href: "/offers", label: "Offer Library" },
  { href: "/pain-points", label: "Pain Point Library" }
];

const schoolLevelLabels: Record<string, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  smk: "SMK",
  mi: "MI",
  mts: "MTs",
  ma: "MA",
  other: "Lainnya"
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isApiPath(pathname: string): boolean {
  return pathname === "/health" || pathname.startsWith("/api/");
}

function sendJson(response: ResponseLike, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function sendSuccess(response: ResponseLike, data: unknown, statusCode = 200): void {
  sendJson(response, statusCode, { ok: true, data });
}

function sendError(response: ResponseLike, statusCode: number, code: string, message: string): void {
  sendJson(response, statusCode, {
    ok: false,
    error: {
      code,
      message
    }
  });
}

function redirect(response: ResponseLike, location: string): void {
  response.writeHead(303, { Location: location });
  response.end();
}

function sendHtml(response: ResponseLike, html: string, statusCode = 200): void {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(html);
}

function getHeader(request: RequestLike, name: string): string {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function readBody(request: RequestLike): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

async function readJsonBody(request: RequestLike): Promise<Record<string, unknown>> {
  const raw = await readBody(request);
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

async function readFormBody(request: RequestLike): Promise<Record<string, string>> {
  const raw = await readBody(request);
  const params = new URLSearchParams(raw);
  const body: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    body[key] = value;
  }
  return body;
}

function renderNav(activePath: string): string {
  return navItems
    .map((item) => {
      const activeClass = activePath === item.href ? "nav-link active" : "nav-link";
      return `<a class="${activeClass}" href="${item.href}">${escapeHtml(item.label)}</a>`;
    })
    .join("");
}

function renderBadge(active: boolean): string {
  return active ? `<span class="badge badge-ok">Aktif</span>` : `<span class="badge">Nonaktif</span>`;
}

function renderSwatch(hexPreview: unknown): string {
  const hex = typeof hexPreview === "string" && hexPreview ? hexPreview : "#ffffff";
  return `<span class="swatch" style="background:${escapeHtml(hex)}"></span>`;
}

function renderMessage(url: URL): string {
  const success = url.searchParams.get("success");
  const error = url.searchParams.get("error");

  if (success) {
    return `<div class="notice success">${escapeHtml(success)}</div>`;
  }

  if (error) {
    return `<div class="notice error">${escapeHtml(error)}</div>`;
  }

  return "";
}

function renderLayout(activePath: string, title: string, eyebrow: string, description: string, content: string): string {
  const currentDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: "Asia/Jakarta"
  }).format(new Date());

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - ${escapeHtml(appName)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7f8;
        --surface: #ffffff;
        --surface-soft: #eef3f1;
        --text: #17201d;
        --muted: #64716c;
        --line: #dbe3df;
        --accent: #0f766e;
        --accent-strong: #115e59;
        --danger: #991b1b;
        --warning: #9a5b13;
        --ok: #166534;
        --shadow: 0 16px 40px rgba(23, 32, 29, 0.08);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      a { color: inherit; text-decoration: none; }

      .shell {
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        min-height: 100vh;
      }

      .sidebar {
        background: #17201d;
        color: #f8fbfa;
        padding: 24px 18px;
        display: flex;
        flex-direction: column;
        gap: 28px;
      }

      .brand { display: flex; align-items: center; gap: 12px; }

      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: linear-gradient(135deg, #0f766e, #f59e0b);
      }

      .brand strong { display: block; font-size: 16px; line-height: 1.2; }
      .brand span { display: block; color: #b7c7c1; font-size: 12px; margin-top: 4px; }

      .nav { display: grid; gap: 6px; }

      .nav-link {
        border-radius: 8px;
        color: #d9e5e1;
        display: block;
        font-size: 14px;
        padding: 10px 12px;
      }

      .nav-link:hover,
      .nav-link.active { background: rgba(255, 255, 255, 0.1); color: #ffffff; }

      .main { min-width: 0; padding: 28px; }

      .topbar {
        align-items: center;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
      }

      .date { color: var(--muted); font-size: 14px; }

      .mode {
        background: #fff7ed;
        border: 1px solid #fed7aa;
        border-radius: 999px;
        color: var(--warning);
        font-size: 13px;
        font-weight: 700;
        padding: 8px 12px;
        white-space: nowrap;
      }

      .surface {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .page-head { padding: 26px 26px 18px; border-bottom: 1px solid var(--line); }
      .eyebrow { color: var(--accent-strong); font-size: 13px; font-weight: 800; margin: 0 0 8px; }
      h1 { font-size: 30px; line-height: 1.15; margin: 0; }
      h2 { font-size: 18px; margin: 0 0 14px; }

      .description {
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
        margin: 12px 0 0;
        max-width: 860px;
      }

      .content { padding: 20px 26px 28px; display: grid; gap: 22px; }
      .table-wrap { overflow-x: auto; }
      table { border-collapse: collapse; min-width: 760px; width: 100%; }

      th,
      td {
        border-bottom: 1px solid var(--line);
        font-size: 14px;
        padding: 13px 14px;
        text-align: left;
        vertical-align: top;
      }

      th { background: var(--surface-soft); color: #34443f; font-weight: 800; }
      tr:last-child td { border-bottom: 0; }
      .muted { color: var(--muted); }

      .badge {
        border: 1px solid var(--line);
        border-radius: 999px;
        color: var(--muted);
        display: inline-flex;
        font-size: 12px;
        font-weight: 800;
        padding: 4px 8px;
        white-space: nowrap;
      }

      .badge-ok { background: #ecfdf5; border-color: #bbf7d0; color: var(--ok); }

      .swatch {
        border: 1px solid rgba(0, 0, 0, 0.18);
        border-radius: 6px;
        display: inline-block;
        height: 28px;
        vertical-align: middle;
        width: 42px;
      }

      .form-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      label { color: #34443f; display: grid; font-size: 13px; font-weight: 800; gap: 7px; }
      input, select {
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--text);
        font: inherit;
        padding: 10px 11px;
        width: 100%;
      }

      .button-row { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; }
      button, .button {
        background: var(--accent);
        border: 0;
        border-radius: 8px;
        color: #ffffff;
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        font-size: 14px;
        font-weight: 800;
        min-height: 38px;
        padding: 9px 12px;
      }

      .button-secondary { background: #34443f; }
      .button-danger { background: var(--danger); }
      .inline-form { display: inline-flex; margin: 0; }

      .notice {
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        padding: 12px 14px;
      }

      .notice.success { background: #ecfdf5; border: 1px solid #bbf7d0; color: var(--ok); }
      .notice.error { background: #fef2f2; border: 1px solid #fecaca; color: var(--danger); }
      .hint { color: var(--muted); font-size: 13px; line-height: 1.5; margin: 0; }

      @media (max-width: 900px) {
        .shell { grid-template-columns: 1fr; }
        .nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 560px) {
        .main { padding: 18px; }
        .topbar { align-items: flex-start; flex-direction: column; }
        .nav, .form-grid { grid-template-columns: 1fr; }
        h1 { font-size: 25px; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"></div>
          <div>
            <strong>${escapeHtml(appName)}</strong>
            <span>Phase 1A Data Foundation</span>
          </div>
        </div>
        <nav class="nav" aria-label="Menu utama">${renderNav(activePath)}</nav>
      </aside>
      <main class="main">
        <div class="topbar">
          <div class="date">${escapeHtml(currentDate)}</div>
          <div class="mode">Mode lokal</div>
        </div>
        <section class="surface">
          <header class="page-head">
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1>${escapeHtml(title)}</h1>
            <p class="description">${escapeHtml(description)}</p>
          </header>
          <div class="content">${content}</div>
        </section>
      </main>
    </div>
  </body>
</html>`;
}

function renderReadOnlyTable(headers: string[], rows: unknown[][]): string {
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowHtml = rows.length
    ? rows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("")
    : `<tr><td colspan="${headers.length}" class="muted">Data belum tersedia. Jalankan migration dan seed.</td></tr>`;

  return `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody></table></div>`;
}

async function renderProductsPage(url: URL): Promise<string> {
  const products = await listProducts();
  const table = renderReadOnlyTable(
    ["Kode", "Produk", "Status"],
    products.map((product: any) => [
      escapeHtml(product.code),
      escapeHtml(product.name),
      renderBadge(Boolean(product.active))
    ])
  );
  return renderLayout(
    "/products",
    "Product Library",
    "Library read-only",
    "Produk aktif MVP hanya Sampul Raport dan Sampul Ijazah.",
    `${renderMessage(url)}${table}`
  );
}

async function renderOffersPage(url: URL): Promise<string> {
  const offers = await listOffers();
  const table = renderReadOnlyTable(
    ["Offer", "Public Phrase", "Syarat", "Risk Note", "Status"],
    offers.map((offer: any) => [
      `<strong>${escapeHtml(offer.title)}</strong><br><span class="muted">${escapeHtml(offer.code)}</span>`,
      escapeHtml(offer.public_phrase),
      escapeHtml(offer.condition_text || "-"),
      escapeHtml(offer.risk_note || "-"),
      renderBadge(Boolean(offer.active))
    ])
  );
  return renderLayout(
    "/offers",
    "Offer Library",
    "Library read-only",
    "Offer disimpan dari campaign knowledge base dan tidak diedit dari UI Phase 1A.",
    `${renderMessage(url)}${table}`
  );
}

async function renderPainPointsPage(url: URL): Promise<string> {
  const painPoints = await listPainPoints();
  const table = renderReadOnlyTable(
    ["Pain Point", "Buyer Fear", "Content Angle", "Safe Claim", "Avoid Claim", "Status"],
    painPoints.map((painPoint: any) => [
      `<strong>${escapeHtml(painPoint.title)}</strong><br><span class="muted">${escapeHtml(painPoint.code)}</span>`,
      escapeHtml(painPoint.buyer_fear || "-"),
      escapeHtml(painPoint.content_angle || "-"),
      escapeHtml(painPoint.safe_claim || "-"),
      escapeHtml(painPoint.avoid_claim || "-"),
      renderBadge(Boolean(painPoint.active))
    ])
  );
  return renderLayout(
    "/pain-points",
    "Pain Point Library",
    "Library read-only",
    "Pain point dipakai sebagai dasar angle konten pada fase berikutnya.",
    `${renderMessage(url)}${table}`
  );
}

function renderColorForm(action: string, color: any | null, buttonLabel: string): string {
  return `
    <form method="post" action="${action}">
      <div class="form-grid">
        <label>Kode
          <input name="code" value="${escapeHtml(color?.code || "")}" ${color ? "readonly" : ""} placeholder="contoh: merah_bata">
        </label>
        <label>Nama
          <input name="name" value="${escapeHtml(color?.name || "")}" required>
        </label>
        <label>Hex Preview
          <input name="hex_preview" value="${escapeHtml(color?.hex_preview || "")}" placeholder="#RRGGBB">
        </label>
        <label>Urutan
          <input name="sort_order" type="number" value="${escapeHtml(color?.sort_order ?? 0)}">
        </label>
      </div>
      <div class="button-row" style="margin-top: 12px;">
        <button type="submit">${escapeHtml(buttonLabel)}</button>
      </div>
    </form>
  `;
}

async function renderColorsPage(url: URL): Promise<string> {
  const colors = await listColors();
  const editId = url.searchParams.get("edit");
  const editingColor = editId ? await getColor(editId) : null;
  const table = renderReadOnlyTable(
    ["Preview", "Kode", "Nama", "Hex", "Status", "Aksi"],
    colors.map((color: any) => [
      renderSwatch(color.hex_preview),
      escapeHtml(color.code),
      escapeHtml(color.name),
      escapeHtml(color.hex_preview || "-"),
      renderBadge(Boolean(color.active)),
      `<div class="button-row">
        <a class="button button-secondary" href="/colors?edit=${escapeHtml(color.id)}">Edit</a>
        <form class="inline-form" method="post" action="/colors/${escapeHtml(color.id)}/${color.active ? "deactivate" : "activate"}">
          <button class="${color.active ? "button-danger" : ""}" type="submit">${color.active ? "Nonaktifkan" : "Aktifkan"}</button>
        </form>
      </div>`
    ])
  );

  const form = `
    <section>
      <h2>${editingColor ? "Edit Warna" : "Tambah Warna"}</h2>
      ${renderColorForm(editingColor ? `/colors/${escapeHtml((editingColor as any).id)}/update` : "/colors/create", editingColor, editingColor ? "Simpan Warna" : "Tambah Warna")}
    </section>
  `;

  return renderLayout(
    "/colors",
    "Color Library",
    "Library editable",
    "Admin bisa menambah, mengedit, mengaktifkan, dan menonaktifkan warna. Seed tidak menimpa perubahan warna yang sudah ada.",
    `${renderMessage(url)}${form}${table}`
  );
}

async function renderSchoolLevelDefaultsPage(url: URL): Promise<string> {
  const defaults = await listSchoolLevelColorDefaults();
  const activeColors = await listColors({ activeOnly: true });
  const options = activeColors
    .map((color: any) => `<option value="${escapeHtml(color.id)}">${escapeHtml(color.name)} (${escapeHtml(color.code)})</option>`)
    .join("");
  const rows = defaults.map((defaultRow: any) => [
    escapeHtml(schoolLevelLabels[defaultRow.school_level] || defaultRow.school_level),
    `${renderSwatch(defaultRow.color_hex_preview)} ${escapeHtml(defaultRow.color_name)} <span class="muted">(${escapeHtml(defaultRow.color_code)})</span>`,
    renderBadge(Boolean(defaultRow.active)),
    `<form method="post" action="/school-level-color-defaults/${escapeHtml(defaultRow.school_level)}" class="button-row">
      <select name="color_id">${activeColors
        .map((color: any) => `<option value="${escapeHtml(color.id)}" ${color.id === defaultRow.color_id ? "selected" : ""}>${escapeHtml(color.name)}</option>`)
        .join("")}</select>
      <button type="submit">Simpan</button>
    </form>`
  ]);

  const createMissing = `
    <section>
      <h2>Atur Rekomendasi Jenjang</h2>
      <p class="hint">Rekomendasi warna ini hanya default awal dan dapat dioverride nanti pada content item atau mockup. SMK valid sebagai jenjang, tetapi belum diberi default seed.</p>
      <form method="post" action="/school-level-color-defaults/set" class="button-row" style="margin-top: 12px;">
        <select name="school_level">
          ${schoolLevels.map((level) => `<option value="${level}">${escapeHtml(schoolLevelLabels[level])}</option>`).join("")}
        </select>
        <select name="color_id">${options}</select>
        <button type="submit">Simpan Rekomendasi</button>
      </form>
    </section>
  `;

  return renderLayout(
    "/school-level-color-defaults",
    "Rekomendasi Warna Jenjang",
    "Library editable",
    "Admin bisa mengubah rekomendasi warna per jenjang tanpa mengubah kode.",
    `${renderMessage(url)}${createMissing}${renderReadOnlyTable(["Jenjang", "Warna", "Status", "Edit"], rows)}`
  );
}

function handleLibraryError(response: ResponseLike, error: unknown, api = true): void {
  if (error instanceof LibraryError) {
    if (api) {
      sendError(response, error.statusCode, error.code, error.message);
      return;
    }
    redirect(response, `/colors?error=${encodeURIComponent(error.message)}`);
    return;
  }

  const message = error instanceof SyntaxError ? "Body JSON tidak valid." : "Terjadi error pada server.";
  if (api) {
    sendError(response, error instanceof SyntaxError ? 400 : 500, error instanceof SyntaxError ? "invalid_json" : "server_error", message);
    return;
  }
  redirect(response, `/colors?error=${encodeURIComponent(message)}`);
}

async function handleApi(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/api/products" && request.method === "GET") {
    sendSuccess(response, await listProducts());
    return true;
  }

  if (pathname === "/api/offers" && request.method === "GET") {
    sendSuccess(response, await listOffers());
    return true;
  }

  if (pathname === "/api/pain-points" && request.method === "GET") {
    sendSuccess(response, await listPainPoints());
    return true;
  }

  if (pathname === "/api/colors" && request.method === "GET") {
    sendSuccess(response, await listColors());
    return true;
  }

  if (pathname === "/api/colors" && request.method === "POST") {
    sendSuccess(response, await createColor(await readJsonBody(request)), 201);
    return true;
  }

  const colorMatch = pathname.match(/^\/api\/colors\/([^/]+)(?:\/(activate|deactivate))?$/);
  if (colorMatch) {
    const [, id, action] = colorMatch;
    if (request.method === "GET" && !action) {
      sendSuccess(response, await getColor(id));
      return true;
    }
    if (request.method === "POST" && !action) {
      sendSuccess(response, await updateColor(id, await readJsonBody(request)));
      return true;
    }
    if (request.method === "POST" && action === "activate") {
      sendSuccess(response, await activateColor(id));
      return true;
    }
    if (request.method === "POST" && action === "deactivate") {
      sendSuccess(response, await deactivateColor(id));
      return true;
    }
  }

  if (pathname === "/api/school-level-color-defaults" && request.method === "GET") {
    sendSuccess(response, await listSchoolLevelColorDefaults());
    return true;
  }

  const defaultMatch = pathname.match(/^\/api\/school-level-color-defaults\/([^/]+)$/);
  if (defaultMatch && request.method === "POST") {
    const body = await readJsonBody(request);
    sendSuccess(response, await upsertSchoolLevelColorDefault(defaultMatch[1], String(body.color_id || "")));
    return true;
  }

  return false;
}

async function handleUiPost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/colors/create" && request.method === "POST") {
    try {
      await createColor(await readFormBody(request));
      redirect(response, "/colors?success=Warna berhasil ditambahkan.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Warna gagal ditambahkan.";
      redirect(response, `/colors?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/colors\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    try {
      await updateColor(updateMatch[1], await readFormBody(request));
      redirect(response, "/colors?success=Warna berhasil disimpan.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Warna gagal disimpan.";
      redirect(response, `/colors?edit=${encodeURIComponent(updateMatch[1])}&error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const colorActionMatch = pathname.match(/^\/colors\/([^/]+)\/(activate|deactivate)$/);
  if (colorActionMatch && request.method === "POST") {
    try {
      if (colorActionMatch[2] === "activate") {
        await activateColor(colorActionMatch[1]);
      } else {
        await deactivateColor(colorActionMatch[1]);
      }
      redirect(response, "/colors?success=Status warna berhasil diperbarui.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status warna gagal diperbarui.";
      redirect(response, `/colors?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const defaultMatch = pathname.match(/^\/school-level-color-defaults\/([^/]+)$/);
  if (defaultMatch && request.method === "POST") {
    try {
      const body = await readFormBody(request);
      await upsertSchoolLevelColorDefault(defaultMatch[1], body.color_id || "");
      redirect(response, "/school-level-color-defaults?success=Rekomendasi warna berhasil disimpan.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rekomendasi warna gagal disimpan.";
      redirect(response, `/school-level-color-defaults?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  if (pathname === "/school-level-color-defaults/set" && request.method === "POST") {
    try {
      const body = await readFormBody(request);
      await upsertSchoolLevelColorDefault(body.school_level || "", body.color_id || "");
      redirect(response, "/school-level-color-defaults?success=Rekomendasi warna berhasil disimpan.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rekomendasi warna gagal disimpan.";
      redirect(response, `/school-level-color-defaults?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  return false;
}

async function handleUiGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/") {
    redirect(response, "/products");
    return true;
  }

  if (pathname === "/products") {
    sendHtml(response, await renderProductsPage(url));
    return true;
  }

  if (pathname === "/offers") {
    sendHtml(response, await renderOffersPage(url));
    return true;
  }

  if (pathname === "/pain-points") {
    sendHtml(response, await renderPainPointsPage(url));
    return true;
  }

  if (pathname === "/colors") {
    sendHtml(response, await renderColorsPage(url));
    return true;
  }

  if (pathname === "/school-level-color-defaults") {
    sendHtml(response, await renderSchoolLevelDefaultsPage(url));
    return true;
  }

  return false;
}

const server = createServer(async (request: RequestLike, response: ResponseLike) => {
  const url = new URL(request.url || "/", `http://${getHeader(request, "host") || "localhost"}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  try {
    if (pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        data: {
          status: "ok",
          app: appName,
          storageReady: existsSync(storageDir),
          databaseReady: await checkDatabase()
        }
      });
      return;
    }

    if (pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, pathname);
      if (!handled) {
        sendError(response, 404, "not_found", "Endpoint tidak ditemukan.");
      }
      return;
    }

    if (request.method === "POST") {
      const handled = await handleUiPost(request, response, pathname);
      if (!handled) {
        sendHtml(response, renderLayout("/products", "Tidak ditemukan", "Error", "Halaman tidak ditemukan.", ""), 404);
      }
      return;
    }

    const handled = await handleUiGet(response, pathname, url);
    if (!handled) {
      sendHtml(response, renderLayout("/products", "Tidak ditemukan", "Error", "Halaman tidak ditemukan.", ""), 404);
    }
  } catch (error) {
    if (isApiPath(pathname)) {
      handleLibraryError(response, error, true);
      return;
    }

    const message = error instanceof Error ? error.message : "Terjadi error pada server.";
    sendHtml(
      response,
      renderLayout(
        "/products",
        "Error",
        "Server error",
        "Halaman gagal dimuat.",
        `<div class="notice error">${escapeHtml(message)}</div>`
      ),
      500
    );
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      level: "info",
      service: "web-app",
      message: "Pesona Studio Desk web started",
      port,
      storageDir
    })
  );
});
