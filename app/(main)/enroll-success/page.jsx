import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import AutoRefresh from "@/components/auto-refresh";
import { getZarinpal } from "@/lib/zarinpal";
import { getCourseDetails } from "@/queries/courses";
import { getUserByEmail } from "@/queries/users";
import { getOrderByAuthority, getOrderForPayment, markOrderPaid, markOrderFailed } from "@/queries/orders";
import { getEffectivePrice } from "@/lib/formatPrice";
import { fulfillPurchase } from "@/lib/payments/fulfill";
import { baleBotLink, isBaleOrderExpired, syncBaleOrder } from "@/lib/payments/bale";
import { CircleCheck, Clock, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Shell = ({ children }) => (
  <div className="h-full w-full flex-1 flex flex-col items-center justify-center p-6">
    <div className="flex flex-col items-center gap-6 max-w-[600px] text-center">{children}</div>
  </div>
);

// ------------------------------------------------------------------ Bale
// The customer pays inside Bale; Bale tells our webhook, which marks the order
// paid and enrols the student. This page just shows the live status (and asks
// Bale directly if the webhook ever got lost).
async function BaleStatus({ token, courseId, user }) {
  const order = await getOrderForPayment(token);

  if (!order || order.method !== "bale" || order.userId !== user.id) {
    return (
      <Shell>
        <XCircle className="w-24 h-24 text-red-500" />
        <h1 className="text-xl font-bold">سفارش پیدا نشد</h1>
        <Button asChild size="sm">
          <Link href="/courses">بازگشت به دوره‌ها</Link>
        </Button>
      </Shell>
    );
  }

  const paid = order.status === "paid" || (await syncBaleOrder(order));
  const customerName = `${user.firstName} ${user.lastName}`;
  const productName = order.course?.title;
  const targetCourseId = courseId || order.courseId;

  if (paid) {
    return (
      <Shell>
        <CircleCheck className="w-32 h-32 bg-green-500 rounded-full p-0 text-white" />
        <h1 className="text-xl md:text-2xl lg:text-3xl">
          تبریک! <strong>{customerName}</strong> ثبت‌نام شما در دوره <strong>{productName}</strong> با موفقیت انجام شد
        </h1>
        <Button asChild size="sm">
          <Link href={`/courses/${targetCourseId}/lesson`}>مشاهده دوره</Link>
        </Button>
      </Shell>
    );
  }

  if (order.status !== "pending" || isBaleOrderExpired(order)) {
    return (
      <Shell>
        <XCircle className="w-24 h-24 text-red-500" />
        <h1 className="text-xl font-bold">مهلت این پرداخت تمام شده است</h1>
        <p className="text-sm text-muted-foreground">اگر مبلغی از حساب شما کسر شده، تا چند دقیقه دیگر خودکار ثبت می‌شود یا با پشتیبانی تماس بگیرید.</p>
        <Button asChild size="sm">
          <Link href={`/courses/${targetCourseId}`}>بازگشت به دوره</Link>
        </Button>
      </Shell>
    );
  }

  const payUrl = order.payUrl || baleBotLink(token);

  return (
    <Shell>
      <AutoRefresh />
      <Clock className="w-20 h-20 text-primary" />
      <h1 className="text-xl font-bold">در انتظار پرداخت در بله</h1>
      <p className="text-sm text-muted-foreground">
        پرداخت دوره‌ی «{productName}» داخل پیام‌رسان بله انجام می‌شود. این صفحه خودکار به‌روز می‌شود و بعد از پرداخت، ثبت‌نام شما
        نهایی می‌شود.
      </p>

      <Button asChild size="lg" className="rounded-xl">
        <a href={payUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="ml-2 h-4 w-4" />
          رفتن به بله و پرداخت
        </a>
      </Button>

      <ol className="space-y-2 text-start text-sm text-muted-foreground">
        <li>۱. روی دکمه‌ی بالا بزنید تا بله باز شود.</li>
        <li>۲. در بله دکمه‌ی «شروع» را بزنید تا فاکتور برایتان ارسال شود.</li>
        <li>۳. فاکتور را با کیف پول بله پرداخت کنید و به همین صفحه برگردید.</li>
      </ol>
    </Shell>
  );
}

// -------------------------------------------------------------- Zarinpal
async function ZarinpalResult({ Authority, Status, courseId, user }) {
  const course = await getCourseDetails(courseId);
  const existingOrder = await getOrderByAuthority(Authority);

  // Payment verification — use the amount actually charged at purchase
  // time (stored on the order), not the course's current price, since the
  // price (or discount) could have changed since then and Zarinpal
  // requires the exact original amount to verify successfully.
  const chargedPrice = existingOrder?.amount ?? getEffectivePrice(course);
  const amount = Math.round(Number(chargedPrice) * 10); // IRR
  let paymentSuccess = existingOrder?.status === "paid";

  // Only hit Zarinpal's verification endpoint (and mutate the order) the
  // first time this callback is reached — refreshing this page shouldn't
  // re-verify, re-enroll, or resend emails.
  if (!paymentSuccess && existingOrder?.status !== "failed") {
    if (Status === "OK") {
      const verify = await getZarinpal().PaymentVerification({
        Amount: amount,
        Authority,
      });

      if (verify.status === 100 || verify.status === 101) {
        paymentSuccess = true;
        await markOrderPaid(Authority, verify.RefID);
      } else {
        await markOrderFailed(Authority);
      }
    } else {
      await markOrderFailed(Authority);
    }
  }

  const customerName = `${user.firstName} ${user.lastName}`;
  const productName = course.title;

  if (paymentSuccess) {
    await fulfillPurchase({
      courseId: course.id,
      userId: user.id,
      customerName,
      customerEmail: user.email,
      method: "zarinpal",
    });
  }

  return (
    <Shell>
      {paymentSuccess && (
        <>
          <CircleCheck className="w-32 h-32 bg-green-500 rounded-full p-0 text-white" />
          <h1 className="text-xl md:text-2xl lg:text-3xl">
            تبریک! <strong>{customerName}</strong> ثبت‌نام شما در دوره <strong>{productName}</strong> با موفقیت انجام شد
          </h1>
        </>
      )}

      {!paymentSuccess && <h1>پرداخت ناموفق بود!</h1>}

      <div className="flex items-center gap-3">
        <Button asChild size="sm">
          <Link href={`/courses/${courseId}/lesson`}>مشاهده دوره</Link>
        </Button>
      </div>
    </Shell>
  );
}

const Success = async ({ searchParams }) => {
  const { Authority, Status, courseId, method, token } = await searchParams;

  const userSession = await auth();
  if (!userSession?.user?.email) redirect("/login");
  const loggedInUser = await getUserByEmail(userSession.user.email);

  if (method === "bale") {
    if (!token) throw new Error("کد پیگیری پرداخت پیدا نشد.");
    return <BaleStatus token={token} courseId={courseId} user={loggedInUser} />;
  }

  if (!Authority) throw new Error("کد پیگیری پرداخت پیدا نشد.");
  return <ZarinpalResult Authority={Authority} Status={Status} courseId={courseId} user={loggedInUser} />;
};

export default Success;
