"use server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { zarinpal } from "@/lib/zarinpal";
import { getCourseDetails } from "@/queries/courses";
import { getUserByEmail } from "@/queries/users";
import { createOrder } from "@/queries/orders";

export async function createZarinpalPayment(data) {
  const origin = (await headers()).get("origin");
  const courseId = data.get("courseId");

  const session = await auth();
  if (!session?.user?.email) throw new Error("You must be logged in to purchase a course");
  const loggedInUser = await getUserByEmail(session.user.email);

  const course = await getCourseDetails(courseId);
  if (!course) throw new Error("Course not found");

  const amount = Math.round(Number(course.price) * 10); // ✅ FIXED

  const response = await zarinpal.PaymentRequest({
    Amount: amount,
    CallbackURL: `${origin}/enroll-success?courseId=${courseId}`,
    Description: `Purchase course: ${course.title}`,
  });

  if (response.status !== 100) {
    console.log("ZARINPAL ERROR", response);
    throw new Error("Zarinpal payment error");
  }

  // Record this attempt as a "pending" invoice so it shows up under
  // /account/Order regardless of whether the payment is later completed,
  // abandoned, or fails.
  await createOrder({
    courseId: course.id,
    userId: loggedInUser.id,
    amount: course.price,
    authority: response.authority,
  });

  return {
    url: response.url,
  };
}
