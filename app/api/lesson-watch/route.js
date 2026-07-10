import { getLoggedInUser } from "@/lib/loggedin-user";
import { prisma } from "@/lib/prisma";
import { getLesson } from "@/queries/lessons";
import { getModuleBySlug } from "@/queries/modules";
import { createWatchReport } from "@/queries/reports";
import { NextResponse } from "next/server";

const STARTED = "started";
const COMPLETED = "completed";

async function updateReport(userId, courseId, moduleId, lessonId) {
  try {
    createWatchReport({ userId, courseId, moduleId, lessonId });
  } catch (error) {
    throw new Error(error);
  }
}

export async function POST(request) {
  const { courseId, lessonId, moduleSlug, state, lastTime } =
    await request.json();

  const loggedinUser = await getLoggedInUser();
  const lesson = await getLesson(lessonId);
  const foundModule = await getModuleBySlug(moduleSlug);

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

  const watchEntry = {
    lastTime,
    lessonId: lesson.id,
    moduleId: foundModule.id,
    userId: loggedinUser.id,
    state,
  };

  try {
    const found = await prisma.watch.findFirst({
      where: {
        lessonId: lessonId,
        moduleId: foundModule.id,
        userId: loggedinUser.id,
      },
    });

    if (state === STARTED) {
      if (!found) {
        await prisma.watch.create({ data: { ...watchEntry, created_at: new Date() } });
      }
    } else if (state === COMPLETED) {
      if (!found) {
        await prisma.watch.create({ data: { ...watchEntry, created_at: new Date() } });
        await updateReport(loggedinUser.id, courseId, foundModule.id, lessonId);
      } else {
        if (found.state === STARTED) {
          await prisma.watch.update({
            where: { id: found._id },
            data: { state: COMPLETED, modified_at: new Date() },
          });
          await updateReport(loggedinUser.id, courseId, foundModule.id, lessonId);
        }
      }
    }

    return new NextResponse("Watch Record added Successfully", {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(error.message, {
      status: 500,
    });
  }
}
