"use server";
import { headers } from "next/headers";
import { zarinpal } from "@/lib/zarinpal";
import { getCourseDetails } from "@/queries/courses";

export async function createZarinpalPayment(data) {
  const origin = (await headers()).get("origin");
  const courseId = data.get("courseId");

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

  return {
    url: response.url,
  };
}
