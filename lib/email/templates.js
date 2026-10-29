// Pure functions that turn data into { subject, html, text }. No env, no DB
// here — callers (lib/email/notify.js) pass in the site info — so the same
// templates can be previewed in tests.
//
// E-mail HTML is written the old-fashioned way (tables + inline CSS) because
// mail clients ignore <style>, flexbox and most modern CSS. Font: Tahoma.

export const FONT = "Tahoma, 'Segoe UI', Arial, sans-serif";

/** Escape user-controlled text before it goes into HTML. */
export function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** "{siteName}" style placeholders chosen by the admin in Settings. */
export function fill(template, vars) {
    return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

const nl2br = (text) => esc(text).replace(/\r?\n/g, '<br>');
const faNumber = (n) => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(n);

export function formatDurationFa(seconds) {
    const total = Math.round(Number(seconds) || 0);
    if (total <= 0) return '';
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const clock = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    return clock.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

// ---------------------------------------------------------------- building blocks

function button(href, label, theme) {
    return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 8px;">
  <tr><td align="center" bgcolor="${theme.color}" style="border-radius:10px;">
    <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:15px;font-weight:bold;color:${theme.onColor};text-decoration:none;border-radius:10px;">${esc(label)}</a>
  </td></tr>
</table>`;
}

function infoTable(rows, theme) {
    const body = rows
        .filter((row) => row && row.value)
        .map(
            (row) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #ececf0;font-size:13px;color:#71717a;width:38%;">${esc(row.label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #ececf0;font-size:14px;color:#18181b;font-weight:bold;">${row.html ? row.value : esc(row.value)}</td>
  </tr>`,
        )
        .join('');
    return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background:#fafafa;border:1px solid #ececf0;border-radius:12px;">
  <tr><td style="padding:6px 18px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${body}</table>
  </td></tr>
</table>`;
}

/** The common frame: coloured header, white card, footer. */
function layout({ site, theme, title, preheader, bodyHtml }) {
    const brand = site.logoUrl
        ? `<img src="${esc(site.logoUrl)}" alt="${esc(site.name)}" height="44" style="display:inline-block;border:0;height:44px;max-width:220px;">`
        : `<span style="font-family:${FONT};font-size:22px;font-weight:bold;color:${theme.onColor};">${esc(site.name)}</span>`;

    return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT};direction:rtl;text-align:right;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader || title)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f4f5;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
      <tr><td align="center" bgcolor="${theme.color}" style="background:${theme.color};padding:26px 20px;border-radius:16px 16px 0 0;">${brand}</td></tr>
      <tr><td style="background:#ffffff;padding:32px 28px;font-family:${FONT};font-size:15px;line-height:2;color:#27272a;direction:rtl;text-align:right;">
        ${bodyHtml}
      </td></tr>
      <tr><td align="center" style="background:#fafafa;padding:20px 24px;border-radius:0 0 16px 16px;border-top:1px solid #ececf0;font-family:${FONT};font-size:12px;line-height:1.9;color:#8a8a93;">
        این ایمیل به‌صورت خودکار از طرف <strong>${esc(site.name)}</strong> ارسال شده است.<br>
        <a href="${esc(site.url)}" target="_blank" style="color:${theme.color};text-decoration:none;">${esc(site.url.replace(/^https?:\/\//, ''))}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const heading = (text) =>
    `<h1 style="margin:0 0 12px;font-family:${FONT};font-size:22px;line-height:1.6;color:#18181b;">${esc(text)}</h1>`;
const para = (html) => `<p style="margin:0 0 14px;">${html}</p>`;
const signatureBlock = (text) =>
    text ? `<p style="margin:26px 0 0;padding-top:16px;border-top:1px solid #ececf0;color:#52525b;font-size:14px;">${esc(text)}</p>` : '';

// ---------------------------------------------------------------- the e-mails
// `site`  = { name, url, logoUrl }      `theme` = { color, onColor }
// `copy`  = the admin-editable texts, already placeholder-filled.

export function welcomeEmail({ site, theme, copy, user }) {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'دانشجوی عزیز';
    const html = layout({
        site,
        theme,
        title: copy.subject,
        preheader: copy.text,
        bodyHtml: `
${heading(`${name} عزیز، خوش آمدید! 🎉`)}
${para(nl2br(copy.text))}
${button(`${site.url}/courses`, 'مشاهده دوره‌ها', theme)}
${para(`<span style="font-size:13px;color:#71717a;">ایمیل حساب شما: <strong dir="ltr">${esc(user.email)}</strong></span>`)}
${signatureBlock(copy.signature)}`,
    });
    return { subject: copy.subject, html, text: `${name} عزیز، خوش آمدید!\n\n${copy.text}\n\n${site.url}/courses` };
}

export function contactConfirmationEmail({ site, theme, copy, message }) {
    const html = layout({
        site,
        theme,
        title: copy.subject,
        preheader: copy.text,
        bodyHtml: `
${heading(`${message.name} عزیز، پیام شما دریافت شد`)}
${para(nl2br(copy.text))}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0;"><tr>
  <td style="border-right:4px solid ${theme.color};background:#fafafa;padding:14px 18px;border-radius:8px;font-size:14px;color:#3f3f46;">
    <div style="font-size:12px;color:#8a8a93;margin-bottom:6px;">نسخه‌ای از پیام شما — موضوع: <strong>${esc(message.subject)}</strong></div>
    ${nl2br(message.message)}
  </td>
</tr></table>
${signatureBlock(copy.signature)}`,
    });
    return {
        subject: copy.subject,
        html,
        text: `${message.name} عزیز، پیام شما دریافت شد.\n\n${copy.text}\n\nموضوع: ${message.subject}\n${message.message}`,
    };
}

export function adminContactEmail({ site, theme, message }) {
    const subject = `پیام جدید از فرم تماس: ${message.subject}`;
    const html = layout({
        site,
        theme,
        title: subject,
        preheader: `${message.name}: ${message.subject}`,
        bodyHtml: `
${heading('پیام جدید در فرم تماس با ما')}
${infoTable(
    [
        { label: 'نام', value: message.name },
        { label: 'ایمیل', value: `<span dir="ltr">${esc(message.email)}</span>`, html: true },
        { label: 'موضوع', value: message.subject },
    ],
    theme,
)}
<div style="background:#fafafa;border:1px solid #ececf0;border-radius:12px;padding:16px 18px;font-size:14px;color:#3f3f46;">${nl2br(message.message)}</div>
${button(`${site.url}/account/messages`, 'مشاهده در پنل مدیریت', theme)}
${para(`<span style="font-size:12px;color:#8a8a93;">با «پاسخ» دادن به همین ایمیل، پاسخ مستقیم برای فرستنده ارسال می‌شود.</span>`)}`,
    });
    return { subject, html, text: `${message.name} <${message.email}>\n${message.subject}\n\n${message.message}\n\n${site.url}/account/messages` };
}

const MAX_LESSONS = 200;

export function purchaseEmail({ site, theme, copy, user, course, receipt }) {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'دانشجوی عزیز';
    const courseUrl = `${site.url}/courses/${course.id}/lesson`;

    let remaining = MAX_LESSONS;
    let hidden = 0;
    const modulesHtml = (course.modules || [])
        .map((module, mIndex) => {
            const lessons = module.lessons || [];
            const shown = lessons.slice(0, Math.max(remaining, 0));
            remaining -= shown.length;
            hidden += lessons.length - shown.length;
            if (shown.length === 0) return '';

            const items = shown
                .map((lesson, lIndex) => {
                    const href = `${courseUrl}?name=${encodeURIComponent(lesson.slug || '')}`;
                    const duration = formatDurationFa(lesson.duration);
                    return `
      <tr>
        <td style="padding:9px 14px;border-top:1px solid #ececf0;font-size:14px;">
          <span style="color:#a1a1aa;font-size:12px;">${faNumber(lIndex + 1)}.</span>
          <a href="${esc(href)}" target="_blank" style="color:#18181b;text-decoration:none;">${esc(lesson.title)}</a>
          ${lesson.access === 'public' ? `<span style="font-size:11px;color:${theme.color};"> • رایگان</span>` : ''}
        </td>
        <td width="70" style="padding:9px 14px;border-top:1px solid #ececf0;font-size:12px;color:#8a8a93;text-align:left;" dir="ltr">${duration}</td>
      </tr>`;
                })
                .join('');

            return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:14px 0;border:1px solid #ececf0;border-radius:12px;border-collapse:separate;overflow:hidden;">
  <tr><td colspan="2" style="background:#fafafa;padding:12px 14px;font-size:14px;font-weight:bold;color:#18181b;">
    <span style="color:${theme.color};">فصل ${faNumber(mIndex + 1)}</span> — ${esc(module.title)}
  </td></tr>${items}
</table>`;
        })
        .join('');

    const html = layout({
        site,
        theme,
        title: copy.subject,
        preheader: `ثبت‌نام شما در «${course.title}» انجام شد`,
        bodyHtml: `
${heading(`${name} عزیز، تبریک! 🎉`)}
${para(nl2br(copy.text))}
<div style="text-align:center;margin:18px 0 4px;padding:18px;border-radius:12px;background:#fafafa;border:1px solid #ececf0;">
  <div style="font-size:12px;color:#8a8a93;">دوره‌ی شما</div>
  <div style="font-size:18px;font-weight:bold;color:#18181b;margin-top:4px;">${esc(course.title)}</div>
</div>
${button(courseUrl, 'ورود به دوره و شروع یادگیری', theme)}

${infoTable(
    [
        { label: 'مبلغ پرداختی', value: receipt.amountText },
        { label: 'روش پرداخت', value: receipt.methodLabel },
        { label: 'کد پیگیری', value: receipt.refId ? `<span dir="ltr">${esc(receipt.refId)}</span>` : '', html: true },
        { label: 'تاریخ', value: receipt.dateText },
    ],
    theme,
)}

${modulesHtml ? `<h2 style="margin:28px 0 4px;font-family:${FONT};font-size:17px;color:#18181b;">سرفصل‌ها و درس‌های دوره</h2>
${para(`<span style="font-size:13px;color:#71717a;">روی هر درس بزنید تا مستقیم همان ویدیو باز شود (ابتدا وارد حساب کاربری خود شوید).</span>`)}
${modulesHtml}
${hidden > 0 ? para(`<span style="font-size:13px;color:#71717a;">و ${faNumber(hidden)} درس دیگر؛ فهرست کامل را در صفحه‌ی دوره ببینید.</span>`) : ''}` : ''}

${button(`${site.url}/account/enrolled-courses`, 'همه‌ی دوره‌های من', theme)}
${signatureBlock(copy.signature)}`,
    });

    const textLessons = (course.modules || [])
        .map((m, i) => `فصل ${i + 1}: ${m.title}\n` + (m.lessons || []).map((l) => `  - ${l.title}: ${courseUrl}?name=${encodeURIComponent(l.slug || '')}`).join('\n'))
        .join('\n\n');
    return {
        subject: copy.subject,
        html,
        text: `${name} عزیز، ثبت‌نام شما در «${course.title}» انجام شد.\n\n${copy.text}\n\nورود به دوره: ${courseUrl}\n\n${textLessons}`,
    };
}

export function instructorSaleEmail({ site, theme, instructor, customerName, courseTitle }) {
    const subject = `ثبت‌نام جدید در دوره ${courseTitle}`;
    const html = layout({
        site,
        theme,
        title: subject,
        preheader: `${customerName} در دوره‌ی شما ثبت‌نام کرد`,
        bodyHtml: `
${heading(`${instructor} عزیز، تبریک! 🎉`)}
${para(`${esc(customerName)} در دوره‌ی «<strong>${esc(courseTitle)}</strong>» ثبت‌نام کرد.`)}
${button(`${site.url}/account`, 'ورود به پنل', theme)}`,
    });
    return { subject, html, text: `${instructor} عزیز، ${customerName} در دوره‌ی «${courseTitle}» ثبت‌نام کرد.` };
}

export function testEmail({ site, theme }) {
    const subject = `ایمیل آزمایشی ${site.name}`;
    const html = layout({
        site,
        theme,
        title: subject,
        preheader: 'اگر این ایمیل را می‌بینید، Resend درست تنظیم شده است.',
        bodyHtml: `
${heading('ارسال ایمیل درست کار می‌کند ✅')}
${para('این یک ایمیل آزمایشی از بخش تنظیمات سایت است. اگر آن را در صندوق ورودی (یا اسپم) می‌بینید، کلید Resend و آدرس فرستنده درست تنظیم شده‌اند.')}
${button(site.url, 'رفتن به سایت', theme)}`,
    });
    return { subject, html, text: 'ارسال ایمیل درست کار می‌کند.' };
}

export function messageEmail({ site, theme, subject, message }) {
    const html = layout({
        site,
        theme,
        title: subject,
        preheader: message,
        bodyHtml: `${heading(subject)}${para(nl2br(message))}`,
    });
    return { subject, html, text: message };
}

// ------------------------------------------------------- comments and tickets

const quoteBlock = (label, text, theme) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:14px 0;"><tr>
  <td style="border-right:4px solid ${theme.color};background:#fafafa;padding:14px 18px;border-radius:8px;font-size:14px;line-height:2;color:#3f3f46;">
    <div style="font-size:12px;color:#8a8a93;margin-bottom:6px;">${esc(label)}</div>
    ${nl2br(text)}
  </td>
</tr></table>`;

const PRIORITY = {
    low: { label: 'کم', bg: '#ecfdf5', fg: '#047857' },
    medium: { label: 'متوسط', bg: '#fffbeb', fg: '#b45309' },
    high: { label: 'زیاد', bg: '#fef2f2', fg: '#b91c1c' },
};
const priorityPill = (priority) => {
    const p = PRIORITY[priority] || PRIORITY.medium;
    return `<span style="display:inline-block;padding:2px 12px;border-radius:999px;background:${p.bg};color:${p.fg};font-size:12px;font-weight:bold;">${p.label}</span>`;
};

/** A reply was written to the recipient's comment (course review or blog comment). */
export function commentReplyEmail({ site, theme, copy, recipient, targetTitle, targetUrl, comment, reply, replier }) {
    const name = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'کاربر عزیز';
    const html = layout({
        site,
        theme,
        title: copy.subject,
        preheader: reply,
        bodyHtml: `
${heading(`${name} عزیز، به دیدگاه شما پاسخ داده شد`)}
${para(nl2br(copy.text))}
${targetTitle ? para(`<span style="font-size:13px;color:#71717a;">درباره‌ی: <strong>${esc(targetTitle)}</strong></span>`) : ''}
${quoteBlock('دیدگاه شما', comment, theme)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:14px 0;"><tr>
  <td style="border-right:4px solid #16a34a;background:#f0fdf4;padding:14px 18px;border-radius:8px;font-size:14px;line-height:2;color:#14532d;">
    <div style="font-size:12px;color:#15803d;margin-bottom:6px;">پاسخ ${esc(replier || site.name)}</div>
    ${nl2br(reply)}
  </td>
</tr></table>
${targetUrl ? button(targetUrl, 'مشاهده در سایت', theme) : ''}
${signatureBlock(copy.signature)}`,
    });
    return { subject: copy.subject, html, text: `${name} عزیز،\n\nدیدگاه شما:\n${comment}\n\nپاسخ:\n${reply}\n\n${targetUrl || site.url}` };
}

const ticketInfo = (ticket, theme) =>
    infoTable(
        [
            { label: 'شماره‌ی تیکت', value: `#${faNumber(ticket.number)}` },
            { label: 'موضوع', value: ticket.subject },
            { label: 'اولویت', value: priorityPill(ticket.priority), html: true },
        ],
        theme,
    );

/** To the student right after they open a ticket. */
export function ticketCreatedEmail({ site, theme, copy, user, ticket, message }) {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'دانشجوی عزیز';
    const url = `${site.url}/account/tickets/${ticket.id}`;
    const html = layout({
        site,
        theme,
        title: copy.subject,
        preheader: copy.text,
        bodyHtml: `
${heading(`${name} عزیز، تیکت شما ثبت شد`)}
${para(nl2br(copy.text))}
${ticketInfo(ticket, theme)}
${quoteBlock('پیام شما', message, theme)}
${button(url, 'مشاهده‌ی تیکت', theme)}
${signatureBlock(copy.signature)}`,
    });
    return { subject: copy.subject, html, text: `${name} عزیز، تیکت #${ticket.number} ثبت شد.\n\n${copy.text}\n\n${url}` };
}

/** To the student when support answers. */
export function ticketReplyEmail({ site, theme, copy, user, ticket, message, staffName }) {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'دانشجوی عزیز';
    const url = `${site.url}/account/tickets/${ticket.id}`;
    const html = layout({
        site,
        theme,
        title: copy.subject,
        preheader: message,
        bodyHtml: `
${heading(`${name} عزیز، پشتیبانی پاسخ داد`)}
${para(nl2br(copy.text))}
${ticketInfo(ticket, theme)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:14px 0;"><tr>
  <td style="border-right:4px solid #16a34a;background:#f0fdf4;padding:14px 18px;border-radius:8px;font-size:14px;line-height:2;color:#14532d;">
    <div style="font-size:12px;color:#15803d;margin-bottom:6px;">پاسخ ${esc(staffName || 'پشتیبانی')}</div>
    ${nl2br(message)}
  </td>
</tr></table>
${button(url, 'مشاهده و پاسخ دادن', theme)}
${signatureBlock(copy.signature)}`,
    });
    return { subject: copy.subject, html, text: `${name} عزیز، به تیکت #${ticket.number} پاسخ داده شد.\n\n${message}\n\n${url}` };
}

/** To the student when support closes the ticket. */
export function ticketClosedEmail({ site, theme, copy, user, ticket }) {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'دانشجوی عزیز';
    const url = `${site.url}/account/tickets/${ticket.id}`;
    const subject = `تیکت #${ticket.number} بسته شد`;
    const html = layout({
        site,
        theme,
        title: subject,
        preheader: ticket.subject,
        bodyHtml: `
${heading(`${name} عزیز، تیکت شما بسته شد`)}
${para('پشتیبانی این تیکت را بسته کرد. اگر هنوز مشکلتان حل نشده، می‌توانید تیکت را دوباره باز کنید یا تیکت جدیدی ثبت کنید.')}
${ticketInfo(ticket, theme)}
${button(url, 'مشاهده‌ی تیکت', theme)}
${signatureBlock(copy.signature)}`,
    });
    return { subject, html, text: `${name} عزیز، تیکت #${ticket.number} بسته شد.\n\n${url}` };
}

/** To the admin: a new ticket, or a new message from the student. */
export function adminTicketEmail({ site, theme, user, ticket, message, kind }) {
    const subject = kind === 'new' ? `تیکت جدید #${ticket.number}: ${ticket.subject}` : `پیام جدید در تیکت #${ticket.number}`;
    const url = `${site.url}/account/tickets/${ticket.id}`;
    const html = layout({
        site,
        theme,
        title: subject,
        preheader: message,
        bodyHtml: `
${heading(kind === 'new' ? 'تیکت جدید ثبت شد' : 'دانشجو به تیکت پاسخ داد')}
${infoTable(
    [
        { label: 'دانشجو', value: `${user.firstName || ''} ${user.lastName || ''}`.trim() },
        { label: 'ایمیل', value: `<span dir="ltr">${esc(user.email)}</span>`, html: true },
        { label: 'شماره‌ی تیکت', value: `#${faNumber(ticket.number)}` },
        { label: 'موضوع', value: ticket.subject },
        { label: 'اولویت', value: priorityPill(ticket.priority), html: true },
    ],
    theme,
)}
${quoteBlock('پیام', message, theme)}
${button(url, 'مشاهده و پاسخ در پنل', theme)}`,
    });
    return { subject, html, text: `${subject}\n\n${message}\n\n${url}` };
}
