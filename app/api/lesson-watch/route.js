import { getLoggedInUser } from "@/lib/loggedin-user";
import { getLesson } from "@/queries/lessons";
import { getModuleBySlug } from "@/queries/modules";
import { NextRequest, NextResponse } from "next/server";

const STARTED = "started";
const COMPLETED = "completed";

export async function POST(request) {
  const { courseId, lessonId, moduleSlug, state, lastTime } =
    await request.json();

  const loggedinUser = await getLoggedInUser();
  const lesson = await getLesson(lessonId);
  const module = await getModuleBySlug(moduleSlug);

  if (!loggedinUser) {
    return new NextResponse(`You are not authenticated.`, {
      status: 401,
    });
  }

  if (state !== STARTED && state !== COMPLETED) {
    return new NextResponse(`Invalid state. Can not process request`, {
      status: 500,
    });
  }

  if (!lesson) {
    return new NextResponse(`Invalid lesson. Can not process request`, {
      status: 500,
    });
  }
}
