import { readFormBody, readJsonBody, type RequestLike } from "../http/request.ts";
import { redirect, sendHtml, sendSuccess, type ResponseLike } from "../http/response.ts";
import {
  checkOperationalHealth,
  createOperationalCampaign,
  createOperationalLead,
  getOperationalSummary,
  listOperationalState,
  markOperationalPosted,
  queueOperationalMockup,
  queueOperationalVideoJob,
  reviewOperationalVideoJob,
  runOperationalSmoke,
  scanOperationalFootage,
  scheduleOperationalPost,
  updateOperationalLead
} from "../operational-mvp-service.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "../views/layout.ts";

export async function handleOperationalMvpApiRoute(
  request: RequestLike,
  response: ResponseLike,
  pathname: string,
  url: URL
): Promise<boolean> {
  if (pathname === "/api/operational/summary" && request.method === "GET") {
    sendSuccess(response, await getOperationalSummary());
    return true;
  }
  if (pathname === "/api/operational/health" && request.method === "GET") {
    sendSuccess(response, await checkOperationalHealth());
    return true;
  }
  if (pathname === "/api/operational/state" && request.method === "GET") {
    sendSuccess(response, await listOperationalState());
    return true;
  }
  if (pathname === "/api/operational/campaigns" && request.method === "POST") {
    sendSuccess(response, await createOperationalCampaign(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/footage/scan" && request.method === "POST") {
    const body = await readJsonBody(request);
    sendSuccess(response, await scanOperationalFootage(typeof body.source_root === "string" ? body.source_root : undefined), 201);
    return true;
  }
  if (pathname === "/api/operational/video-jobs" && request.method === "POST") {
    sendSuccess(response, await queueOperationalVideoJob(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/video-jobs/review" && request.method === "POST") {
    sendSuccess(response, await reviewOperationalVideoJob(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/schedules" && request.method === "POST") {
    sendSuccess(response, await scheduleOperationalPost(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/schedules/posted" && request.method === "POST") {
    sendSuccess(response, await markOperationalPosted(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/mockups" && request.method === "POST") {
    sendSuccess(response, await queueOperationalMockup(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/leads" && request.method === "POST") {
    sendSuccess(response, await createOperationalLead(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/leads/update" && request.method === "POST") {
    sendSuccess(response, await updateOperationalLead(await readJsonBody(request) as any), 201);
    return true;
  }
  if (pathname === "/api/operational/smoke" && request.method === "POST") {
    sendSuccess(response, await runOperationalSmoke(), 201);
    return true;
  }
  return false;
}

export async function handleOperationalMvpPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname !== "/" && pathname !== "/operational") return false;
  const state = await listOperationalState() as any;
  const summary = await getOperationalSummary();
  const content = `
    ${renderMessage(url)}
    <div class="stat-grid">
      ${stat("Campaign aktif", summary.campaigns)}
      ${stat("Item konten", summary.content_items)}
      ${stat("Footage", summary.footage_assets)}
      ${stat("Draft review", summary.draft_ready)}
      ${stat("Jadwal hari ini", summary.schedules_today)}
      ${stat("Mockup jobs", summary.mockup_jobs)}
      ${stat("Lead", summary.leads)}
      ${stat("Queue video", summary.video_jobs)}
    </div>
    <section><h2>Buat Campaign 30 Hari</h2>${campaignForm()}</section>
    <section><h2>Footage Inbox</h2>${scanForm()}${renderReadOnlyTable(["File", "Durasi", "Orientasi", "Status"], state.footage.map((item: any) => [
      escapeHtml(item.relative_path), escapeHtml(item.duration_seconds || "-"), escapeHtml(item.orientation), escapeHtml(item.qa_status)
    ]))}</section>
    <section><h2>Kalender, Script, dan Shot List</h2>${renderReadOnlyTable(["Tanggal", "Kode", "Angle", "Status", "Aksi"], state.contentItems.map((item: any) => [
      escapeHtml(item.planned_date?.toISOString?.().slice(0, 10) || String(item.planned_date).slice(0, 10)),
      escapeHtml(item.content_code),
      escapeHtml(item.angle),
      escapeHtml(item.status),
      queueVideoForm(item.id)
    ]))}</section>
    <section><h2>Draft Video & Approval</h2>${renderReadOnlyTable(["Status", "Output", "Caption", "Aksi"], state.videoJobs.map((job: any) => [
      escapeHtml(job.status),
      job.output_path ? `<a href="/${escapeHtml(job.output_path)}">${escapeHtml(job.output_path)}</a>` : "-",
      escapeHtml(job.caption || job.error_message || "-"),
      reviewForms(job)
    ]))}</section>
    <section><h2>Scheduler Posting Manual</h2>${scheduleForm(state.contentItems, state.videoJobs)}${renderReadOnlyTable(["Channel", "Jam", "Status", "URL", "Aksi"], state.schedules.map((item: any) => [
      escapeHtml(item.channel), escapeHtml(item.scheduled_at), escapeHtml(item.status), escapeHtml(item.posted_url || "-"), postForm(item.id)
    ]))}</section>
    <section><h2>Mockup Awal Otomatis</h2>${mockupForm()}${renderReadOnlyTable(["Sekolah", "Produk", "Status", "Output"], state.mockups.map((item: any) => [
      escapeHtml(item.school_name), escapeHtml(item.product_type), escapeHtml(item.status), item.output_path ? `<a href="/${escapeHtml(item.output_path)}">${escapeHtml(item.output_path)}</a>` : "-"
    ]))}</section>
    <section><h2>Lead Log Ringan</h2>${leadForm()}${renderReadOnlyTable(["Nama", "Channel", "Status", "Catatan", "Aksi"], state.leads.map((item: any) => [
      escapeHtml(item.name), escapeHtml(item.channel), escapeHtml(item.status), escapeHtml(item.notes || "-"), leadUpdateForm(item.id)
    ]))}</section>
  `;
  sendHtml(response, renderLayout("/operational", "Dashboard Operasional", "MVP Operasional", "Jalur kerja nyata untuk campaign, footage, render, approval, scheduler, mockup, dan lead.", content));
  return true;
}

export async function handleOperationalMvpPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (!pathname.startsWith("/operational/")) return false;
  const body = await readFormBody(request);
  if (pathname === "/operational/campaigns") await createOperationalCampaign({ name: body.name, product_type: body.product_type, theme: body.theme, start_date: body.start_date, days: 30 });
  else if (pathname === "/operational/footage/scan") await scanOperationalFootage(body.source_root || undefined);
  else if (pathname === "/operational/video-jobs") await queueOperationalVideoJob({ content_item_id: body.content_item_id, provider: "mock" });
  else if (pathname === "/operational/video-jobs/review") await reviewOperationalVideoJob({ job_id: body.job_id, action: body.action as any, notes: body.notes });
  else if (pathname === "/operational/schedules") await scheduleOperationalPost({ content_item_id: body.content_item_id, video_job_id: body.video_job_id, channel: body.channel, scheduled_at: body.scheduled_at });
  else if (pathname === "/operational/schedules/posted") await markOperationalPosted({ schedule_id: body.schedule_id, posted_url: body.posted_url });
  else if (pathname === "/operational/mockups") await queueOperationalMockup({ school_name: body.school_name, product_type: body.product_type, color_hex: body.color_hex, city: body.city });
  else if (pathname === "/operational/leads") await createOperationalLead({ name: body.name, wa: body.wa, school_name: body.school_name, channel: body.channel, status: body.status, notes: body.notes });
  else if (pathname === "/operational/leads/update") await updateOperationalLead({ id: body.id, status: body.status, notes: body.notes });
  else return false;
  redirect(response, "/operational?success=Data operasional tersimpan.");
  return true;
}

function stat(label: string, value: number): string {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function campaignForm(): string {
  return `<form method="post" action="/operational/campaigns" class="form-grid">
    <label>Nama campaign<input name="name" value="Campaign Sampul Sekolah" required></label>
    <label>Produk<select name="product_type"><option value="sampul_raport">Sampul Raport</option><option value="sampul_ijazah">Sampul Ijazah</option></select></label>
    <label>Tema<input name="theme" value="Proses produksi rapi untuk sekolah" required></label>
    <label>Mulai<input type="date" name="start_date" value="${new Date().toISOString().slice(0, 10)}" required></label>
    <button class="button" type="submit">Buat 30 Hari</button>
  </form>`;
}

function scanForm(): string {
  return `<form method="post" action="/operational/footage/scan" class="form-grid">
    <label>Folder footage<input name="source_root" value="${escapeHtml(process.env.OPERATIONAL_FOOTAGE_SOURCE_DIR || "storage/footage")}" required></label>
    <button class="button" type="submit">Scan Footage</button>
  </form>`;
}

function queueVideoForm(contentItemId: string): string {
  return `<form method="post" action="/operational/video-jobs"><input type="hidden" name="content_item_id" value="${escapeHtml(contentItemId)}"><button class="button button-secondary" type="submit">Queue Render</button></form>`;
}

function reviewForms(job: any): string {
  if (job.status !== "draft_ready") return "-";
  return `<div class="button-row">
    ${reviewForm(job.id, "approve", "Approve")}
    ${reviewForm(job.id, "revision", "Revisi")}
    ${reviewForm(job.id, "reject", "Reject")}
  </div>`;
}

function reviewForm(jobId: string, action: string, label: string): string {
  return `<form method="post" action="/operational/video-jobs/review"><input type="hidden" name="job_id" value="${escapeHtml(jobId)}"><input type="hidden" name="action" value="${escapeHtml(action)}"><input type="hidden" name="notes" value="${escapeHtml(label)}"><button class="button button-secondary" type="submit">${escapeHtml(label)}</button></form>`;
}

function scheduleForm(items: any[], jobs: any[]): string {
  const itemOptions = items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.content_code)}</option>`).join("");
  const jobOptions = jobs.filter((job) => job.status === "approved" || job.status === "draft_ready").map((job) => `<option value="${escapeHtml(job.id)}">${escapeHtml(job.output_path || job.id)}</option>`).join("");
  return `<form method="post" action="/operational/schedules" class="form-grid">
    <label>Konten<select name="content_item_id">${itemOptions}</select></label>
    <label>Video<select name="video_job_id"><option value="">Tanpa video</option>${jobOptions}</select></label>
    <label>Channel<select name="channel"><option>instagram</option><option>facebook</option><option>tiktok</option><option>youtube</option></select></label>
    <label>Jam<input type="datetime-local" name="scheduled_at"></label>
    <button class="button" type="submit">Ready to Post</button>
  </form>`;
}

function postForm(scheduleId: string): string {
  return `<form method="post" action="/operational/schedules/posted" class="button-row"><input type="hidden" name="schedule_id" value="${escapeHtml(scheduleId)}"><input name="posted_url" placeholder="URL posting manual" required><button class="button button-secondary" type="submit">Tandai Posted</button></form>`;
}

function mockupForm(): string {
  return `<form method="post" action="/operational/mockups" class="form-grid">
    <label>Nama sekolah<input name="school_name" required></label>
    <label>Produk<select name="product_type"><option value="sampul_raport">Sampul Raport</option><option value="sampul_ijazah">Sampul Ijazah</option></select></label>
    <label>Warna<input name="color_hex" value="#6E1F1F"></label>
    <label>Kota<input name="city"></label>
    <button class="button" type="submit">Queue Mockup</button>
  </form>`;
}

function leadForm(): string {
  return `<form method="post" action="/operational/leads" class="form-grid">
    <label>Nama<input name="name" required></label>
    <label>WA<input name="wa"></label>
    <label>Sekolah<input name="school_name"></label>
    <label>Channel<input name="channel" value="instagram" required></label>
    <label>Status<select name="status"><option>WA Masuk</option><option>Mockup Dikirim</option><option>Tanya Harga</option><option>Masuk Penawaran</option><option>Tidak Lanjut</option></select></label>
    <label>Catatan<textarea name="notes"></textarea></label>
    <button class="button" type="submit">Simpan Lead</button>
  </form>`;
}

function leadUpdateForm(id: string): string {
  return `<form method="post" action="/operational/leads/update" class="button-row"><input type="hidden" name="id" value="${escapeHtml(id)}"><select name="status"><option>WA Masuk</option><option>Mockup Dikirim</option><option>Tanya Harga</option><option>Masuk Penawaran</option><option>Tidak Lanjut</option></select><input name="notes" placeholder="Catatan"><button class="button button-secondary" type="submit">Update</button></form>`;
}
