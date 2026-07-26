import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getReport } from "@/queries/reports";
import { getCertificateRequest } from "@/queries/certificateRequests";
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

    const report = await getReport({
      course: courseId,
      student: loggedInUser.id,
    });

    const completionDate = report?.completion_date
      ? formatMyDate(report.completion_date)
      : formatMyDate(Date.now());

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
    ] = await Promise.all([
      getAsset("fonts/kalam/Kalam-Regular.ttf"),
      getAsset("fonts/montserrat/Montserrat-Italic.ttf"),
      getAsset("fonts/montserrat/Montserrat-Medium.ttf"),
      getAsset("logo.png"),
      getAsset("sign.png"),
      getAsset("pattern.jpg"),
    ]);

    /* -----------------
     * PDF
     *-------------------*/
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const kalamFont = await pdfDoc.embedFont(kalamFontBytes);
    const montserratItalic = await pdfDoc.embedFont(montserratItalicFontBytes);
    const montserrat = await pdfDoc.embedFont(montserratFontBytes);

    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

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
     * Name
     *-------------------*/
    const nameWidth = kalamFont.widthOfTextAtSize(completionInfo.name, 40);

    page.drawText(completionInfo.name, {
      x: width / 2 - nameWidth / 2,
      y: height - 240,
      size: 40,
      font: kalamFont,
    });

    /* -----------------
     * Details
     *-------------------*/
    const detailsText = `This is to certify that ${completionInfo.name} successfully completed the ${completionInfo.courseName} course on ${completionInfo.completionDate} by ${completionInfo.instructor}`;

    page.drawText(detailsText, {
      x: width / 2 - 350,
      y: height - 330,
      size: 16,
      font: montserrat,
      maxWidth: 700,
    });

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

    page.drawText(completionInfo.instructor, {
      x: width - signatureBoxWidth,
      y: 90,
      size: 14,
      font: timesRomanFont,
    });

    page.drawText(completionInfo.instructorDesignation, {
      x: width - signatureBoxWidth,
      y: 72,
      size: 10,
      font: timesRomanFont,
      maxWidth: 250,
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
