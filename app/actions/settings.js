"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_PRIMARY, normalizeHex } from "@/lib/theme";
import { GATEWAYS, getMissingGatewayEnv, isKnownGateway } from "@/lib/payments/gateways";
import { BALE_TEST_PROVIDER_TOKEN, baleApi } from "@/lib/payments/bale";
import { SITE_URL } from "@/lib/seo";
import { SITE_SECTIONS, sanitizeSiteSection } from "@/lib/site-defaults";
import { getSetting } from "@/lib/settings";
import { sendTestEmail } from "@/lib/email/notify";
import { assertAdmin } from "@/lib/admin-guard";
import { SITE_STATUS_KEY, sanitizeSiteStatus } from "@/lib/site-status-defaults";
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
    if (typeof driver.applyCors !== "function") {
      return { ok: false, message: "این سرویس نیازی به تنظیم CORS ندارد." };
    }
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

export async function saveThemeColor(color) {
  try {
    await assertAdmin();

    const hex = normalizeHex(color);
    if (!hex) {
      return { ok: false, message: "رنگ واردشده معتبر نیست. مثال: #4f46e5" };
    }

    await setSetting("theme", { primaryColor: hex });
    revalidatePath("/", "layout");
    return { ok: true, message: "رنگ اصلی سایت تغییر کرد.", color: hex };
  } catch (error) {
    console.error("saveThemeColor error:", error);
    return { ok: false, message: "ذخیره‌ی رنگ با مشکل مواجه شد." };
  }
}

export async function resetThemeColor() {
  try {
    await assertAdmin();
    await setSetting("theme", { primaryColor: DEFAULT_PRIMARY });
    revalidatePath("/", "layout");
    return { ok: true, message: "رنگ پیش‌فرض بازگردانده شد.", color: DEFAULT_PRIMARY };
  } catch (error) {
    console.error("resetThemeColor error:", error);
    return { ok: false, message: "بازگردانی رنگ با مشکل مواجه شد." };
  }
}

// ------------------------------------------------------------- site status

export async function saveSiteStatus(input) {
  try {
    await assertAdmin();
    const status = sanitizeSiteStatus(input);
    await setSetting(SITE_STATUS_KEY, status);
    revalidatePath("/", "layout");
    return { ok: true, message: "وضعیت سایت ذخیره شد.", status };
  } catch (error) {
    console.error("saveSiteStatus error:", error);
    return { ok: false, message: "ذخیره‌ی وضعیت سایت با مشکل مواجه شد." };
  }
}

// ---------------------------------------------------------------- payments

export async function savePaymentGateways(ids) {
  try {
    await assertAdmin();

    const selected = [...new Set(Array.isArray(ids) ? ids : [])];
    if (selected.length === 0) {
      return { ok: false, message: "حداقل یک درگاه پرداخت باید فعال باشد." };
    }

    for (const id of selected) {
      if (!isKnownGateway(id)) {
        return { ok: false, message: "درگاه انتخاب‌شده نامعتبر است." };
      }
      const missing = getMissingGatewayEnv(id);
      if (missing.length > 0) {
        return {
          ok: false,
          message: `«${GATEWAYS[id].label}» هنوز کامل تنظیم نشده. این متغیرها را در env بگذارید: ${missing.join(", ")}`,
        };
      }
    }

    await setSetting("payments", { enabledGateways: selected });
    revalidatePath("/account/settings");
    return { ok: true, message: "درگاه‌های پرداخت ذخیره شد." };
  } catch (error) {
    console.error("savePaymentGateways error:", error);
    return { ok: false, message: "ذخیره‌ی تنظیمات با مشکل مواجه شد." };
  }
}

export async function testBaleConnection() {
  try {
    await assertAdmin();

    const missing = getMissingGatewayEnv("bale");
    if (missing.length > 0) {
      return { ok: false, message: `ابتدا این متغیرها را تنظیم کنید: ${missing.join(", ")}` };
    }

    const me = await baleApi.getMe();
    const configured = String(process.env.BALE_BOT_USERNAME || "").replace(/^@/, "").toLowerCase();
    const actual = String(me?.username || "").toLowerCase();

    const notes = [];
    if (actual && configured && actual !== configured) {
      notes.push(`⚠️ BALE_BOT_USERNAME با نام کاربری واقعی بازو (@${me.username}) یکی نیست.`);
    }
    if (process.env.BALE_PROVIDER_TOKEN === BALE_TEST_PROVIDER_TOKEN) {
      notes.push("توکن پرداخت از نوع آزمایشی است؛ پول واقعی جابه‌جا نمی‌شود.");
    }

    return {
      ok: true,
      message: `به بازوی «${me?.first_name || me?.username}» (@${me?.username}) وصل شد. ${notes.join(" ")}`.trim(),
    };
  } catch (error) {
    return { ok: false, message: `اتصال به بله برقرار نشد: ${error?.message || "خطای ناشناخته"}` };
  }
}

export async function registerBaleWebhook() {
  try {
    await assertAdmin();

    const missing = getMissingGatewayEnv("bale");
    if (missing.length > 0) {
      return { ok: false, message: `ابتدا این متغیرها را تنظیم کنید: ${missing.join(", ")}` };
    }
    if (!SITE_URL.startsWith("https://")) {
      return {
        ok: false,
        message: "وب‌هوک بله فقط روی آدرس HTTPS کار می‌کند. NEXT_PUBLIC_SITE_URL را روی دامنه‌ی https سایت بگذارید.",
      };
    }

    const url = `${SITE_URL}/api/bale/webhook/${process.env.BALE_WEBHOOK_SECRET}`;
    await baleApi.setWebhook(url);
    const info = await baleApi.getWebhookInfo().catch(() => null);

    const registered = info?.url ? "ثبت شد" : "ثبت شد (وضعیت قابل خواندن نبود)";
    return { ok: true, message: `وب‌هوک بله ${registered}: ${SITE_URL}/api/bale/webhook/••••••` };
  } catch (error) {
    return { ok: false, message: `ثبت وب‌هوک ناموفق بود: ${error?.message || "خطای ناشناخته"}` };
  }
}

// ---------------------------------------------------------------- site info

// Saves ONE section of the site content (general, footer, contact, ...).
export async function saveSiteSection(section, values) {
  try {
    await assertAdmin();

    if (!SITE_SECTIONS.includes(section)) {
      return { ok: false, message: "بخش نامعتبر است." };
    }

    const clean = sanitizeSiteSection(section, values);
    const stored = (await getSetting("site")) || {};
    await setSetting("site", { ...stored, [section]: clean });

    revalidatePath("/", "layout");
    return { ok: true, message: "تغییرات ذخیره شد.", values: clean };
  } catch (error) {
    console.error("saveSiteSection error:", error);
    return { ok: false, message: "ذخیره‌ی تغییرات با مشکل مواجه شد." };
  }
}

// Puts a section back to the built-in defaults.
export async function resetSiteSection(section) {
  try {
    await assertAdmin();

    if (!SITE_SECTIONS.includes(section)) {
      return { ok: false, message: "بخش نامعتبر است." };
    }

    const stored = (await getSetting("site")) || {};
    const { [section]: _removed, ...rest } = stored;
    await setSetting("site", rest);

    revalidatePath("/", "layout");
    return { ok: true, message: "به حالت پیش‌فرض برگشت.", values: sanitizeSiteSection(section, {}) };
  } catch (error) {
    console.error("resetSiteSection error:", error);
    return { ok: false, message: "بازگردانی با مشکل مواجه شد." };
  }
}

export async function sendTestEmailAction(to) {
  try {
    await assertAdmin();

    const address = String(to || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      return { ok: false, message: "آدرس ایمیل معتبر نیست." };
    }

    const result = await sendTestEmail(address);
    return result.ok
      ? { ok: true, message: `ایمیل آزمایشی به ${address} ارسال شد. صندوق ورودی و اسپم را چک کنید.` }
      : { ok: false, message: result.error || "ارسال ایمیل ناموفق بود." };
  } catch (error) {
    console.error("sendTestEmailAction error:", error);
    return { ok: false, message: "ارسال ایمیل ناموفق بود." };
  }
}

// Quick on/off switches shown next to the feature they control (messages,
// comments, tickets pages). Same values as in Settings -> e-mails.
const EMAIL_SWITCHES = ["contactEnabled", "adminNotifyEnabled", "commentReplyEnabled", "ticketEnabled"];

export async function setEmailSwitch(key, value) {
  try {
    await assertAdmin();

    if (!EMAIL_SWITCHES.includes(key)) {
      return { ok: false, message: "گزینه‌ی نامعتبر است." };
    }

    const stored = (await getSetting("site")) || {};
    const email = sanitizeSiteSection("email", { ...(stored.email || {}), [key]: Boolean(value) });
    await setSetting("site", { ...stored, email });

    revalidatePath("/", "layout");
    return { ok: true, message: value ? "ارسال ایمیل فعال شد." : "ارسال ایمیل غیرفعال شد." };
  } catch (error) {
    console.error("setEmailSwitch error:", error);
    return { ok: false, message: "ذخیره‌ی تغییر با مشکل مواجه شد." };
  }
}
