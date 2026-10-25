import { sendSimpleMessage } from "@/lib/email/notify";

// Backwards-compatible helper: sendEmails([{ to, subject, message }]).
// New code should use the specific functions in lib/email/notify.js.
export const sendEmails = async (emailInfo) => {
  if (!emailInfo) return null;

  return Promise.allSettled(
    emailInfo.map(async (data) => {
      if (!(data.to && data.subject && data.message)) {
        throw new Error(`Could not send email, please check ${JSON.stringify(data)}.`);
      }
      return sendSimpleMessage(data);
    }),
  );
};
