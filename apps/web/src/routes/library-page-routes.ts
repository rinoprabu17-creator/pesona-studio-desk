import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { activateColor, createColor, deactivateColor, updateColor, upsertSchoolLevelColorDefault } from "../library-service.ts";
import { renderLayout } from "../views/layout.ts";
import {
  renderColorsPage,
  renderOffersPage,
  renderPainPointsPage,
  renderProductsPage,
  renderSchoolLevelDefaultsPage
} from "../views/library-pages.ts";

export async function handleLibraryPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
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

export async function handleLibraryPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
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

export function renderNotFoundPage(): string {
  return renderLayout("/products", "Tidak ditemukan", "Error", "Halaman tidak ditemukan.", "");
}
