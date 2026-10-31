"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { getZarinpal } from "@/lib/zarinpal";
import { getCourseDetails } from "@/queries/courses";
import { getUserByEmail } from "@/queries/users";
import { createOrder } from "@/queries/orders";
import { hasEnrollmentForCourse } from "@/queries/enrollments";
import { getEffectivePrice } from "@/lib/formatPrice";
import { getEnabledGatewayIds, getEnabledGateways } from "@/lib/payments/settings";
import { startBalePayment } from "@/lib/payments/bale";
import { SITE_URL } from "@/lib/seo";

// The payment methods the customer can pick from (enabled + configured).
export async function getCheckoutGateways() {
  return getEnabledGateways();
}

// Starts a payment with the gateway the customer picked and returns where to
// send them. Returns { ok, url } or { ok:false, message } — never throws, so
// the checkout dialog can show a readable error.
export async function startCheckout(courseId, gatewayId) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { ok: false, message: "برای خرید دوره ابتدا وارد حساب کاربری شوید." };
    }
    const user = await getUserByEmail(session.user.email);

    const course = await getCourseDetails(courseId);
    if (!course) return { ok: false, message: "دوره پیدا نشد." };

    const enabled = await getEnabledGatewayIds();
    if (!enabled.includes(gatewayId)) {
      return { ok: false, message: "این درگاه پرداخت در حال حاضر فعال نیست." };
    }

    if (user.role === "admin") {
      return { ok: false, message: "مدیران به همه‌ی دوره‌ها دسترسی کامل دارند و نیازی به خرید نیست." };
    }

    if (await hasEnrollmentForCourse(course.id, user.id)) {
      return { ok: false, message: "شما قبلاً در این دوره ثبت‌نام کرده‌اید." };
    }

    const amountToman = getEffectivePrice(course); // discount-aware
    if (!(amountToman > 0)) {
      return { ok: false, message: "قیمت این دوره برای پرداخت آنلاین معتبر نیست." };
    }

    const origin = (await headers()).get("origin") || SITE_URL;

    if (gatewayId === "zarinpal") {
      const response = await getZarinpal().PaymentRequest({
        Amount: Math.round(Number(amountToman) * 10), // Toman -> Rial
        CallbackURL: `${origin}/enroll-success?courseId=${courseId}`,
        Description: `Purchase course: ${course.title}`,
      });

      if (response.status !== 100) {
        console.error("ZARINPAL ERROR", response);
        return { ok: false, message: "اتصال به زرین‌پال ناموفق بود. دوباره تلاش کنید." };
      }

      // Pending "invoice": visible under /account/Order even if never completed.
      await createOrder({
        courseId: course.id,
        userId: user.id,
        amount: amountToman,
        authority: response.authority,
        method: "zarinpal",
      });

      return { ok: true, url: response.url };
    }

    if (gatewayId === "bale") {
      const { token } = await startBalePayment({ course, user, amountToman });
      // The customer first lands on our own "waiting for payment" page, which
      // links to Bale and updates itself as soon as the payment is confirmed.
      return {
        ok: true,
        url: `${origin}/enroll-success?method=bale&token=${token}&courseId=${courseId}`,
      };
    }

    return { ok: false, message: "درگاه پرداخت نامعتبر است." };
  } catch (error) {
    console.error("startCheckout error:", error);
    return { ok: false, message: "شروع پرداخت با مشکل مواجه شد. لطفاً دوباره تلاش کنید." };
  }
}
