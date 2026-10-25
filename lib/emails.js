import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { getSiteSettings } from "@/lib/site-settings";

// Resend only accepts a sender on a domain you verified there, so this stays an
// environment setting: EMAIL_FROM="ایزی‌لرن <support@ezylearn.ir>".
const EMAIL_FROM = process.env.EMAIL_FROM || "support@serviceinnbd.com";

const resend = new Resend(process.env.RESEND_API_KEY);
// [
//     {
//         to: "infor@easylearingbd.com",
//         subject: "it a greate",
//         message: "asdfsadfsad fasd"
//     },

// ]

export const sendEmails = async (emailInfo) => {
  if (!emailInfo) return null;

  const { general, contact } = await getSiteSettings();

  const response = await Promise.allSettled(
    emailInfo.map(async (data) => {
      if (data.to && data.subject && data.message) {
        const to = data.to;
        const subject = data.subject;
        const message = data.message;

        const sendInfo = await resend.emails.send({
          from: EMAIL_FROM,
          to: to,
          subject: subject,
          react: EmailTemplate({ message, siteName: general.name, supportEmail: contact.email }),
        });

        return sendInfo;
      } else {
        new Promise((reject) => {
          return reject(
            new Error(
              `Could not send email, Please check the ${JSON.stringify(data)}.`,
            ),
          );
        });
      }
    }),
  );

  return response;
};
