import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getCertificateRequest } from "@/queries/certificateRequests";
import { getPassedAttempt } from "@/lib/exam";
import { formatMyDate } from "@/lib/date";

/* مهم: جلوگیری از build-time execution */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* -----------------
 * Helper
 *-------------------*/
const getAsset = async (relativePath) => {
  return fs.readFile(path.join(process.cwd(), "public", relativePath));
};

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return Response.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = await getCourseDetails(courseId);
    const loggedInUser = await getLoggedInUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificateRequest = await getCertificateRequest(courseId, loggedInUser.id);
    if (certificateRequest?.status !== "approved") {
      return Response.json(
        { error: "این مدرک هنوز توسط مدرس یا ادمین تایید نشده است." },
        { status: 403 },
      );
    }

    // The certificate is only issued to students who passed the course exam.
    const attempt = await getPassedAttempt(courseId, loggedInUser.id);
    if (!attempt) {
      return Response.json({ error: "برای دریافت مدرک باید در آزمون دوره قبول شوید." }, { status: 403 });
    }

    const completionDate = formatMyDate(attempt?.finishedAt || Date.now());

    const quizScore =
      attempt && attempt.totalQuestions > 0
        ? {
            correct: attempt.correctCount,
            total: attempt.totalQuestions,
            percentage: Math.round((attempt.correctCount / attempt.totalQuestions) * 100),
          }
        : null;

    const completionInfo = {
      name: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
      completionDate,
      courseName: course?.title || "Course",
      instructor: `${course?.instructor?.firstName || ""} ${
        course?.instructor?.lastName || ""
      }`,
      instructorDesignation: course?.instructor?.designation || "",
    };

    /* -----------------
     * Assets
     *-------------------*/
    const [
      kalamFontBytes,
      montserratItalicFontBytes,
      montserratFontBytes,
      logoBytes,
      signBytes,
      patternBytes,
      vazirFontBytes,
    ] = await Promise.all([
      getAsset("fonts/kalam/Kalam-Regular.ttf"),
      getAsset("fonts/montserrat/Montserrat-Italic.ttf"),
      getAsset("fonts/montserrat/Montserrat-Medium.ttf"),
      getAsset("logo.png"),
      getAsset("sign.png"),
      getAsset("pattern.jpg"),
      getAsset("fonts/Vazir/Vazir-FD-WOL.ttf"),
    ]);

    /* -----------------
     * PDF
     *-------------------*/
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const kalamFont = await pdfDoc.embedFont(kalamFontBytes);
    const montserratItalic = await pdfDoc.embedFont(montserratItalicFontBytes);
    const montserrat = await pdfDoc.embedFont(montserratFontBytes);
    // Persian/Arabic text: the Latin fonts have no glyphs for it (and the
    // built-in Times font even throws on it), so those strings use Vazir.
    const vazir = await pdfDoc.embedFont(vazirFontBytes);

    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    const hasPersian = (text) => /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || "");

    // Draws one line. Persian text -> Vazir, anything else -> `latinFont`.
    const drawLine = (text, { x, y, size, latinFont, color, center = false }) => {
      const value = String(text ?? "").trim();
      if (!value) return;
      const font = hasPersian(value) ? vazir : latinFont;
      let textWidth = 0;
      try {
        textWidth = font.widthOfTextAtSize(value, size);
        page.drawText(value, {
          x: center ? width / 2 - textWidth / 2 : x,
          y,
          size,
          font,
          color,
        });
      } catch (error) {
        // A character the font can't encode must never break the whole certificate.
        console.error("Certificate: skipped unprintable text:", error?.message);
      }
    };

    /* -----------------
     * Logo
     *-------------------*/
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoDim = logo.scale(0.5);

    page.drawImage(logo, {
      x: width / 2 - logoDim.width / 2,
      y: height - 120,
      width: logoDim.width,
      height: logoDim.height,
    });

    /* -----------------
     * Title
     *-------------------*/
    const titleText = "Certificate Of Completion";

    const titleWidth = montserrat.widthOfTextAtSize(titleText, 30);

    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - (logoDim.height + 125),
      size: 30,
      font: montserrat,
      color: rgb(0, 0.53, 0.71),
    });

    /* -----------------
     * Name + details (each value on its own line so Persian names
     * don't get mixed into an English sentence)
     *-------------------*/
    drawLine("This is to certify that", { y: height - 205, size: 16, latinFont: montserrat, center: true });
    drawLine(completionInfo.name, { y: height - 255, size: 40, latinFont: kalamFont, center: true });
    drawLine("has successfully completed the course", {
      y: height - 295,
      size: 16,
      latinFont: montserrat,
      center: true,
    });
    drawLine(completionInfo.courseName, {
      y: height - 330,
      size: 24,
      latinFont: montserrat,
      color: rgb(0, 0.53, 0.71),
      center: true,
    });
    drawLine(`on ${completionInfo.completionDate}`, {
      y: height - 360,
      size: 16,
      latinFont: montserrat,
      center: true,
    });

    /* -----------------
     * Exam score (the student passed the course exam to get here)
     *-------------------*/
    if (quizScore && quizScore.total > 0) {
      drawLine(`Exam Score: ${quizScore.correct}/${quizScore.total} (${quizScore.percentage}%)`, {
        y: height - 390,
        size: 14,
        latinFont: montserratItalic,
        color: rgb(0, 0.53, 0.71),
        center: true,
      });
    }

    /* -----------------
     * Signature
     *-------------------*/
    const sign = await pdfDoc.embedPng(signBytes);

    const signatureBoxWidth = 300;

    page.drawImage(sign, {
      x: width - signatureBoxWidth,
      y: 120,
      width: 180,
      height: 54,
    });

    drawLine(completionInfo.instructor, {
      x: width - signatureBoxWidth,
      y: 90,
      size: 14,
      latinFont: montserrat,
    });

    drawLine(completionInfo.instructorDesignation, {
      x: width - signatureBoxWidth,
      y: 72,
      size: 10,
      latinFont: montserrat,
    });

    /* -----------------
     * Background
     *-------------------*/
    const pattern = await pdfDoc.embedJpg(patternBytes);

    page.drawImage(pattern, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 0.2,
    });

    /* -----------------
     * Response
     *-------------------*/
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "content-type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Certificate error:", error);

    return Response.json(
      { error: "Failed to generate certificate" },
      { status: 500 },
    );
  }
}
