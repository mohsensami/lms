import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { sendEmails } from "@/lib/emails";
import { zarinpal } from "@/lib/zarinpal";
import { getCourseDetails } from "@/queries/courses";
import { enrollForCourse, hasEnrollmentForCourse } from "@/queries/enrollments";
import { getUserByEmail } from "@/queries/users";
import { getOrderByAuthority, markOrderPaid, markOrderFailed } from "@/queries/orders";
import { getEffectivePrice } from "@/lib/formatPrice";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Success = async ({ searchParams: { Authority, Status, courseId } }) => {
  if (!Authority) throw new Error("Authority code is missing");

  const userSession = await auth();
  if (!userSession?.user?.email) redirect("/login");

  const course = await getCourseDetails(courseId);
  const loggedInUser = await getUserByEmail(userSession.user.email);
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
      const verify = await zarinpal.PaymentVerification({
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

  const customerName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
  const customerEmail = loggedInUser.email;
  const productName = course.title;

  if (paymentSuccess) {
    const alreadyEnrolled = await hasEnrollmentForCourse(course.id, loggedInUser.id);

    if (!alreadyEnrolled) {
      await enrollForCourse(course.id, loggedInUser.id, "zarinpal");

      const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;
      const instructorEmail = course.instructor.email;

      const emailsToSend = [
        {
          to: instructorEmail,
          subject: `New Enrollment For ${productName}`,
          message: `Congratulations, ${instructorName}. A new student, ${customerName} has enrolled in your course ${productName}.`,
        },
        {
          to: customerEmail,
          subject: `Enrollment success for ${productName}`,
          message: `Hey, ${customerName}. You have successfully enrolled in the course ${productName}.`,
        },
      ];

      await sendEmails(emailsToSend);
    }
  }

  return (
    <div className="h-full w-full flex-1 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-[600px] text-center">
        {paymentSuccess && (
          <>
            <CircleCheck className="w-32 h-32 bg-green-500 rounded-full p-0 text-white" />
            <h1 className="text-xl md:text-2xl lg:text-3xl">
              تبریک! <strong>{customerName}</strong> ثبت‌نام شما در دوره{" "}
              <strong>{productName}</strong> با موفقیت انجام شد
            </h1>
          </>
        )}

        {!paymentSuccess && <h1>پرداخت ناموفق بود!</h1>}

        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href={`/courses/${courseId}/lesson`}>مشاهده دوره</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;
