import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";

type PageDefinition = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  columns: string[];
  emptyState: string;
};

const appName = process.env.APP_NAME || "Pesona Studio Desk";
const port = Number(process.env.APP_PORT || process.env.PORT || "3000");
const storageDir = process.env.APP_STORAGE_DIR || join(process.cwd(), "storage");

const pages: PageDefinition[] = [
  {
    slug: "campaign-calendar",
    title: "Campaign Calendar",
    eyebrow: "Kalender konten",
    description: "Rencana konten dan status produksi akan tampil di sini pada fase berikutnya.",
    columns: ["Tanggal", "Produk", "Pilar", "Hook", "Status"],
    emptyState: "Belum ada kalender konten."
  },
  {
    slug: "shot-list",
    title: "Shot List",
    eyebrow: "Panduan footage",
    description: "Daftar scene, angle kamera, dan instruksi visual akan disiapkan setelah modul konten dibuat.",
    columns: ["Content ID", "Scene", "Durasi", "Instruksi", "Status"],
    emptyState: "Belum ada shot list."
  },
  {
    slug: "footage-inbox",
    title: "Footage Inbox",
    eyebrow: "Kotak masuk footage",
    description: "Footage lokal dan status QA akan ditampilkan di sini tanpa integrasi Google Drive dulu.",
    columns: ["File", "Content ID", "Orientasi", "Kelayakan", "Status"],
    emptyState: "Belum ada footage masuk."
  },
  {
    slug: "draft-videos",
    title: "Draft Videos",
    eyebrow: "Draft render",
    description: "Antrian dan hasil render video draft akan muncul setelah worker render diimplementasikan.",
    columns: ["Content ID", "Versi", "Template", "Output", "Status"],
    emptyState: "Belum ada draft video."
  },
  {
    slug: "approval-board",
    title: "Approval Board",
    eyebrow: "Review konten",
    description: "Review video, caption, dan CTA akan dibuat sebagai workflow manual pada fase berikutnya.",
    columns: ["Content ID", "Reviewer", "Catatan", "Keputusan", "Status"],
    emptyState: "Belum ada konten untuk review."
  },
  {
    slug: "mockup-generator",
    title: "Mockup Generator",
    eyebrow: "Mockup awal",
    description: "Form mockup awal akan dibuat nanti tanpa revisi mockup dan tanpa desain final otomatis.",
    columns: ["Nama Sekolah", "Jenis Sampul", "Warna", "Output", "Status"],
    emptyState: "Belum ada request mockup."
  },
  {
    slug: "lead-log",
    title: "Lead Log",
    eyebrow: "Catatan lead ringan",
    description: "Lead awal dari konten akan dicatat manual sebelum lead serius masuk Growth OS Lite.",
    columns: ["Tanggal", "Nama", "Channel", "Keyword", "Status"],
    emptyState: "Belum ada lead tercatat."
  }
];

const statusItems = [
  { label: "Postgres", value: process.env.DATABASE_URL ? "Terkonfigurasi" : "Belum diset" },
  { label: "Redis", value: process.env.REDIS_URL ? "Terkonfigurasi" : "Belum diset" },
  { label: "Storage lokal", value: existsSync(storageDir) ? "Siap" : "Belum ada" }
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderNav(activeSlug: string): string {
  return pages
    .map((page) => {
      const activeClass = page.slug === activeSlug ? "nav-link active" : "nav-link";
      return `<a class="${activeClass}" href="/${page.slug}">${escapeHtml(page.title)}</a>`;
    })
    .join("");
}

function renderEmptyTable(page: PageDefinition): string {
  const headers = page.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>
          <tr>
            <td colspan="${page.columns.length}" class="empty-state">${escapeHtml(page.emptyState)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderStatusRail(): string {
  return statusItems
    .map(
      (item) => `
        <div class="status-item">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderPage(page: PageDefinition): string {
  const currentDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: "Asia/Jakarta"
  }).format(new Date());

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)} - ${escapeHtml(appName)}</title>
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
        --warning: #9a5b13;
        --shadow: 0 16px 40px rgba(23, 32, 29, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

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

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: linear-gradient(135deg, #0f766e, #f59e0b);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
      }

      .brand strong {
        display: block;
        font-size: 16px;
        line-height: 1.2;
      }

      .brand span {
        display: block;
        color: #b7c7c1;
        font-size: 12px;
        margin-top: 4px;
      }

      .nav {
        display: grid;
        gap: 6px;
      }

      .nav-link {
        border-radius: 8px;
        color: #d9e5e1;
        display: block;
        font-size: 14px;
        padding: 10px 12px;
      }

      .nav-link:hover,
      .nav-link.active {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .main {
        min-width: 0;
        padding: 28px;
      }

      .topbar {
        align-items: center;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
      }

      .date {
        color: var(--muted);
        font-size: 14px;
      }

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

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 20px;
      }

      .surface {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
        box-shadow: var(--shadow);
      }

      .page-head {
        padding: 26px 26px 18px;
        border-bottom: 1px solid var(--line);
      }

      .eyebrow {
        color: var(--accent-strong);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0;
        margin: 0 0 8px;
      }

      h1 {
        font-size: 30px;
        line-height: 1.15;
        margin: 0;
      }

      .description {
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
        margin: 12px 0 0;
        max-width: 780px;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        border-collapse: collapse;
        min-width: 720px;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--line);
        font-size: 14px;
        padding: 14px 16px;
        text-align: left;
        vertical-align: middle;
      }

      th {
        background: var(--surface-soft);
        color: #34443f;
        font-weight: 800;
      }

      .empty-state {
        color: var(--muted);
        height: 180px;
        text-align: center;
      }

      .status-panel {
        padding: 18px;
      }

      .status-panel h2 {
        font-size: 16px;
        margin: 0 0 14px;
      }

      .status-list {
        display: grid;
        gap: 10px;
      }

      .status-item {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 12px;
      }

      .status-item span {
        color: var(--muted);
        display: block;
        font-size: 12px;
        margin-bottom: 6px;
      }

      .status-item strong {
        font-size: 14px;
      }

      @media (max-width: 900px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
        }

        .nav {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .layout {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .main {
          padding: 18px;
        }

        .topbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .nav {
          grid-template-columns: 1fr;
        }

        h1 {
          font-size: 25px;
        }
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
            <span>Local MVP skeleton</span>
          </div>
        </div>
        <nav class="nav" aria-label="Menu utama">
          ${renderNav(page.slug)}
        </nav>
      </aside>
      <main class="main">
        <div class="topbar">
          <div class="date">${escapeHtml(currentDate)}</div>
          <div class="mode">Mode lokal</div>
        </div>
        <div class="layout">
          <section class="surface">
            <header class="page-head">
              <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
              <h1>${escapeHtml(page.title)}</h1>
              <p class="description">${escapeHtml(page.description)}</p>
            </header>
            ${renderEmptyTable(page)}
          </section>
          <aside class="surface status-panel">
            <h2>Status sistem</h2>
            <div class="status-list">
              ${renderStatusRail()}
            </div>
          </aside>
        </div>
      </main>
    </div>
  </body>
</html>`;
}

function sendHtml(response: any, html: string): void {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(html);
}

function sendJson(response: any, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      app: appName,
      storageReady: existsSync(storageDir)
    });
    return;
  }

  if (pathname === "/") {
    response.writeHead(302, { Location: `/${pages[0].slug}` });
    response.end();
    return;
  }

  const slug = pathname.slice(1);
  const page = pages.find((candidate) => candidate.slug === slug);

  if (!page) {
    sendJson(response, 404, {
      status: "not_found",
      message: "Halaman tidak ditemukan."
    });
    return;
  }

  sendHtml(response, renderPage(page));
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      level: "info",
      service: "web-app",
      message: "Pesona Studio Desk web placeholder started",
      port,
      storageDir
    })
  );
});
