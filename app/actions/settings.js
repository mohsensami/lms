"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-guard";
import { setSetting } from "@/lib/settings";
import {
  PROVIDERS,
  getStorageDriver,
  isKnownProvider,
  getMissingEnv,
} from "@/lib/storage";

// These actions return { ok, message } instead of throwing: Next.js hides the
// text of thrown server-action errors in production, and the admin needs to
// see exactly what went wrong (wrong key, missing bucket, ...).

export async function saveStorageProvider(providerId) {
  try {
    await assertAdmin();

    if (!isKnownProvider(providerId)) {
      return { ok: false, message: "ارائه‌دهنده‌ی انتخاب‌شده نامعتبر است." };
    }

    const missing = getMissingEnv(providerId);
    if (missing.length > 0) {
      return {
        ok: false,
        message: `ابتدا این متغیرها را در فایل env تنظیم کنید: ${missing.join(", ")}`,
      };
    }

    await setSetting("storage", { activeProvider: providerId });
    revalidatePath("/account/settings");

    return {
      ok: true,
      message: `از این پس ویدیوهای جدید در ${PROVIDERS[providerId].label} آپلود می‌شوند.`,
    };
  } catch (error) {
    console.error("saveStorageProvider error:", error);
    return { ok: false, message: "ذخیره‌ی تنظیمات با مشکل مواجه شد." };
  }
}

export async function testStorageConnection(providerId) {
  try {
    await assertAdmin();

    if (!isKnownProvider(providerId)) {
      return { ok: false, message: "ارائه‌دهنده‌ی انتخاب‌شده نامعتبر است." };
    }

    const driver = getStorageDriver(providerId);
    await driver.testConnection();
    return { ok: true, message: "اتصال به باکت با موفقیت برقرار شد." };
  } catch (error) {
    console.error("testStorageConnection error:", error);
    return {
      ok: false,
      message: `اتصال برقرار نشد: ${error?.message || "خطای ناشناخته"}`,
    };
  }
}

function siteOrigins() {
  const origins = new Set();
  for (const value of [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL]) {
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // ignore malformed values
    }
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
  }
  return [...origins];
}

/** Lets browsers upload parts directly to the bucket from this site. */
export async function applyStorageCors(providerId) {
  try {
    await assertAdmin();

    if (!isKnownProvider(providerId)) {
      return { ok: false, message: "ارائه‌دهنده‌ی انتخاب‌شده نامعتبر است." };
    }

    const origins = siteOrigins();
    if (origins.length === 0) {
      return {
        ok: false,
        message: "آدرس سایت مشخص نیست. NEXT_PUBLIC_SITE_URL را در فایل env تنظیم کنید.",
      };
    }

    const driver = getStorageDriver(providerId);
    await driver.applyCors(origins);
    return { ok: true, message: `تنظیمات CORS برای ${origins.join("، ")} اعمال شد.` };
  } catch (error) {
    console.error("applyStorageCors error:", error);
    return {
      ok: false,
      message: `اعمال CORS ناموفق بود: ${error?.message || "خطای ناشناخته"}`,
    };
  }
}
