export type NavItem = {
  href: string;
  label: string;
};

const appName = process.env.APP_NAME || "Pesona Studio Desk";

export const navItems: NavItem[] = [
  { href: "/campaigns", label: "Campaign" },
  { href: "/content-calendar", label: "Kalender Konten" },
  { href: "/content-items", label: "Konten" },
  { href: "/approved-videos", label: "Approved Videos" },
  { href: "/footage-assets", label: "Footage" },
  { href: "/products", label: "Product Library" },
  { href: "/colors", label: "Color Library" },
  { href: "/school-level-color-defaults", label: "Rekomendasi Warna" },
  { href: "/offers", label: "Offer Library" },
  { href: "/pain-points", label: "Pain Point Library" }
];

export const schoolLevelLabels: Record<string, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  smk: "SMK",
  mi: "MI",
  mts: "MTs",
  ma: "MA",
  other: "Lainnya"
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderNav(activePath: string): string {
  return navItems
    .map((item) => {
      const activeClass = activePath === item.href ? "nav-link active" : "nav-link";
      return `<a class="${activeClass}" href="${item.href}">${escapeHtml(item.label)}</a>`;
    })
    .join("");
}

export function renderBadge(active: boolean): string {
  return active ? `<span class="badge badge-ok">Aktif</span>` : `<span class="badge">Nonaktif</span>`;
}

export function renderSwatch(hexPreview: unknown): string {
  const hex = typeof hexPreview === "string" && hexPreview ? hexPreview : "#ffffff";
  return `<span class="swatch" style="background:${escapeHtml(hex)}"></span>`;
}

export function renderMessage(url: URL): string {
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

export function renderReadOnlyTable(headers: string[], rows: unknown[][]): string {
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowHtml = rows.length
    ? rows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("")
    : `<tr><td colspan="${headers.length}" class="muted">Data belum tersedia. Jalankan migration dan seed.</td></tr>`;

  return `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody></table></div>`;
}

export function renderLayout(activePath: string, title: string, eyebrow: string, description: string, content: string): string {
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
      input, select, textarea {
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--text);
        font: inherit;
        padding: 10px 11px;
        width: 100%;
      }

      textarea { min-height: 110px; resize: vertical; }

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
