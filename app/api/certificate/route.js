import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getReport } from "@/queries/reports";
import { formatMyDate } from "@/lib/date";

// Helper: read files from /public
const getAsset = async (relativePath) => {
  return await fs.readFile(path.join(process.cwd(), "public", relativePath));
};

export async function GET(request) {
  try {
    /* -----------------
     * Data
     *-------------------*/
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const course = await getCourseDetails(courseId);
    const loggedInUser = await getLoggedInUser();

    const report = await getReport({
      course: courseId,
      student: loggedInUser.id,
    });

    const completionDate = report?.completion_date
      ? formatMyDate(report.completion_date)
      : formatMyDate(Date.now());

    const completionInfo = {
      name: `${loggedInUser?.firstName} ${loggedInUser?.lastName}`,
      completionDate,
      courseName: course.title,
      instructor: `${course?.instructor?.firstName} ${course?.instructor?.lastName}`,
      instructorDesignation: course?.instructor?.designation,
    };

    /* -----------------
     * Load assets (NO FETCH)
     *-------------------*/
    const kalamFontBytes = await getAsset("fonts/kalam/Kalam-Regular.ttf");

    const montserratItalicFontBytes = await getAsset(
      "fonts/montserrat/Montserrat-Italic.ttf",
    );

    const montserratFontBytes = await getAsset(
      "fonts/montserrat/Montserrat-Medium.ttf",
    );

    const logoBytes = await getAsset("logo.png");
    const signBytes = await getAsset("sign.png");
    const patternBytes = await getAsset("pattern.jpg");

    /* -----------------
     * PDF setup
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
    const titleFontSize = 30;

    const titleWidth = montserrat.widthOfTextAtSize(titleText, titleFontSize);

    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - (logoDim.height + 125),
      size: titleFontSize,
      font: montserrat,
      color: rgb(0, 0.53, 0.71),
    });

    /* -----------------
     * Subtitle
     *-------------------*/
    const labelText = "This certificate is hereby bestowed upon";

    const labelFontSize = 20;

    const labelWidth = montserratItalic.widthOfTextAtSize(
      labelText,
      labelFontSize,
    );

    page.drawText(labelText, {
      x: width / 2 - labelWidth / 2,
      y: height - (logoDim.height + 170),
      size: labelFontSize,
      font: montserratItalic,
    });

    /* -----------------
     * Name
     *-------------------*/
    const nameText = completionInfo.name;
    const nameFontSize = 40;

    const nameWidth = kalamFont.widthOfTextAtSize(nameText, nameFontSize);

    page.drawText(nameText, {
      x: width / 2 - nameWidth / 2,
      y: height - (logoDim.height + 220),
      size: nameFontSize,
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

    page.drawLine({
      start: { x: width - signatureBoxWidth, y: 110 },
      end: { x: width - 60, y: 110 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    /* -----------------
     * Background pattern
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
     * Return PDF
     *-------------------*/
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "content-type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Certificate error:", error);

    return new Response("Error generating certificate", {
      status: 500,
    });
  }
}
