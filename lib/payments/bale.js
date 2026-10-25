import 'server-only';
import { randomBytes, timingSafeEqual } from 'crypto';
import { createOrder, getOrderForPayment, markOrderPaidOnce, updateOrderBale } from '@/queries/orders';
import { fulfillPurchase } from '@/lib/payments/fulfill';

/**
 * Bale wallet payments through the official Bale Bot API (https://docs.bale.ai).
 *
 * How a payment flows:
 *   1. The site creates a pending Order with a random token and sends the
 *      customer to Bale. Two modes (env BALE_PAY_MODE):
 *        bot   (default) https://ble.ir/<bot>?start=<token>. The customer taps
 *              "Start", our webhook receives "/start <token>" and answers with
 *              a wallet invoice (sendInvoice).
 *        link  an invoice link made with createInvoiceLink.
 *   2. The customer pays in Bale. Bale calls our webhook with
 *      `pre_checkout_query` (we must answer within 10 s) and, after the money
 *      moved, `successful_payment`.
 *   3. On successful_payment the order becomes "paid" and the student is
 *      enrolled. If a webhook is ever missed, the return page asks Bale
 *      directly with inquireTransaction.
 *
 * Amounts: course prices are Toman, Bale wants integer Rial (x10).
 */

const API_BASE = 'https://tapi.bale.ai';
export const BALE_TEST_PROVIDER_TOKEN = 'WALLET-TEST-1111111111111111';
const EXPIRY_MINUTES = Number(process.env.BALE_PAY_EXPIRY_MINUTES) || 30;

export const toRial = (toman) => Math.round(Number(toman) * 10);
const clip = (text, max) => Array.from(String(text || '')).slice(0, max).join('');

export function getBaleMode() {
    return process.env.BALE_PAY_MODE === 'link' ? 'link' : 'bot';
}

// ---------------------------------------------------------------- API client

async function call(method, params = {}) {
    const res = await fetch(`${API_BASE}/bot${process.env.BALE_BOT_TOKEN}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.ok) {
        throw new Error(body?.description || `خطای بله (${res.status})`);
    }
    return body.result ?? true;
}

export const baleApi = {
    getMe: () => call('getMe'),
    getWebhookInfo: () => call('getWebhookInfo'),
    setWebhook: (url) => call('setWebhook', { url }),
    sendMessage: (chatId, text) => call('sendMessage', { chat_id: String(chatId), text }),

    sendInvoice: ({ chatId, title, description, payload, amountRial, photoUrl }) =>
        call('sendInvoice', {
            chat_id: String(chatId),
            title: clip(title, 32),
            description: clip(description, 255),
            payload,
            provider_token: process.env.BALE_PROVIDER_TOKEN,
            prices: [{ label: clip(title, 32), amount: amountRial }],
            ...(photoUrl ? { photo_url: photoUrl } : {}),
        }),

    createInvoiceLink: ({ title, description, payload, amountRial }) =>
        call('createInvoiceLink', {
            title: clip(title, 32),
            description: clip(description, 255),
            payload,
            provider_token: process.env.BALE_PROVIDER_TOKEN,
            prices: [{ label: clip(title, 32), amount: amountRial }],
        }),

    answerPreCheckoutQuery: (queryId, ok, errorMessage) =>
        call('answerPreCheckoutQuery', {
            pre_checkout_query_id: String(queryId),
            ok,
            ...(ok ? {} : { error_message: errorMessage || 'پرداخت مجاز نیست.' }),
        }),

    inquireTransaction: (transactionId) => call('inquireTransaction', { transaction_id: String(transactionId) }),
};

// ------------------------------------------------------------------- helpers

/** Constant-time check of the secret embedded in the webhook URL. */
export function verifyWebhookSecret(provided) {
    const expected = process.env.BALE_WEBHOOK_SECRET || '';
    if (!expected || typeof provided !== 'string') return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

export function baleBotLink(token) {
    return `https://ble.ir/${process.env.BALE_BOT_USERNAME}?start=${token}`;
}

export function isBaleOrderExpired(order) {
    return Date.now() - new Date(order.createdAt).getTime() > EXPIRY_MINUTES * 60 * 1000;
}

function describeOrder(order) {
    const courseTitle = order.course?.title || 'دوره';
    return { title: courseTitle, description: `ثبت‌نام در دوره «${courseTitle}»` };
}

// ------------------------------------------------------------- start payment

/**
 * Creates the pending order and returns the token that identifies it.
 * `payUrl` is where the customer completes the payment inside Bale.
 */
export async function startBalePayment({ course, user, amountToman }) {
    const token = randomBytes(16).toString('hex'); // 32 chars, letters+digits only (valid for ?start=)
    let payUrl;

    if (getBaleMode() === 'link') {
        payUrl = await baleApi.createInvoiceLink({
            title: course.title,
            description: `ثبت‌نام در دوره «${course.title}»`,
            payload: token,
            amountRial: toRial(amountToman),
        });
        if (typeof payUrl !== 'string' || !payUrl) {
            throw new Error('بله لینک پرداخت نساخت.');
        }
    } else {
        payUrl = baleBotLink(token);
    }

    await createOrder({
        courseId: course.id,
        userId: user.id,
        amount: amountToman,
        authority: token,
        method: 'bale',
    });
    await updateOrderBale(token, { payUrl });

    return { token, payUrl };
}

// ------------------------------------------------------------------- webhook

async function safeSend(chatId, text) {
    try {
        await baleApi.sendMessage(chatId, text);
    } catch (error) {
        console.error('Bale sendMessage failed:', error?.message);
    }
}

async function handleStartMessage(message) {
    const chatId = String(message.chat?.id ?? '');
    const fromId = String(message.from?.id ?? '');
    // Only private chats: the payer must be the person talking to the bot.
    if (!chatId || chatId !== fromId) return;

    const match = /^\/start(?:\s+([A-Za-z0-9]+))?$/.exec((message.text || '').trim());
    if (!match) return;

    const token = match[1];
    if (!token) {
        await safeSend(chatId, 'برای پرداخت، از داخل سایت روی «پرداخت» بزنید و درگاه بله را انتخاب کنید.');
        return;
    }

    const order = await getOrderForPayment(token);
    if (!order || order.method !== 'bale') {
        await safeSend(chatId, 'این لینک پرداخت معتبر نیست. لطفاً دوباره از سایت اقدام کنید.');
        return;
    }
    if (order.status === 'paid') {
        await safeSend(chatId, 'این سفارش قبلاً پرداخت شده است. به سایت برگردید و دوره را ببینید. ✅');
        return;
    }
    if (order.status !== 'pending' || isBaleOrderExpired(order)) {
        await safeSend(chatId, 'مهلت این پرداخت تمام شده است. لطفاً دوباره از سایت اقدام کنید.');
        return;
    }

    await updateOrderBale(token, { baleChatId: chatId });

    try {
        const { title, description } = describeOrder(order);
        await baleApi.sendInvoice({
            chatId,
            title,
            description,
            payload: token,
            amountRial: toRial(order.amount),
        });
    } catch (error) {
        console.error('Bale sendInvoice failed:', error?.message);
        await safeSend(chatId, 'ساخت فاکتور ناموفق بود. لطفاً چند دقیقه بعد دوباره تلاش کنید.');
    }
}

/** pre_checkout_query: Bale waits max 10 s for our yes/no. */
async function handlePreCheckout(query) {
    const token = String(query.invoice_payload || '');
    const order = await getOrderForPayment(token);

    let error = null;
    if (!order || order.method !== 'bale') error = 'این پرداخت معتبر نیست.';
    else if (order.status === 'paid') error = 'این سفارش قبلاً پرداخت شده است.';
    else if (order.status !== 'pending') error = 'این سفارش دیگر قابل پرداخت نیست.';
    else if (String(query.currency || '').toUpperCase() !== 'IRR' || Number(query.total_amount) !== toRial(order.amount))
        error = 'مبلغ فاکتور با سفارش مطابقت ندارد.';
    else if (order.baleChatId && String(query.from?.id) !== order.baleChatId)
        error = 'این فاکتور متعلق به حساب بله دیگری است.';

    if (error) {
        await baleApi.answerPreCheckoutQuery(query.id, false, error);
        return;
    }

    // Remember the Bale transaction id so a missed webhook can be recovered
    // later with inquireTransaction.
    await updateOrderBale(token, {
        transactionId: String(query.id),
        baleChatId: order.baleChatId || String(query.from?.id ?? ''),
    });
    await baleApi.answerPreCheckoutQuery(query.id, true);
}

/** Confirms the order, then enrols the student (idempotent). */
async function confirmPaid(order, refId) {
    const won = await markOrderPaidOnce(order.authority, refId);
    if (!won) return false; // someone else (webhook / return page) already did it

    const user = order.user;
    await fulfillPurchase({
        courseId: order.courseId,
        userId: order.userId,
        customerName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        customerEmail: user?.email,
        method: 'bale',
        amountToman: order.amount,
        refId,
    });
    return true;
}

async function handleSuccessfulPayment(message) {
    const payment = message.successful_payment;
    const token = String(payment.invoice_payload || '');
    const order = await getOrderForPayment(token);

    if (!order || order.method !== 'bale') {
        console.error('Bale successful_payment for an unknown order:', token);
        return;
    }

    if (String(payment.currency || '').toUpperCase() !== 'IRR' || Number(payment.total_amount) !== toRial(order.amount)) {
        // Money moved but the numbers disagree: never auto-enrol, flag it.
        console.error('Bale successful_payment amount mismatch — review manually:', token, payment);
        return;
    }

    const chargeId = payment.telegram_payment_charge_id || payment.provider_payment_charge_id || '';
    const done = await confirmPaid(order, chargeId);

    if (done) {
        const chatId = message.chat?.id ?? message.from?.id;
        if (chatId) {
            await safeSend(chatId, 'پرداخت شما با موفقیت انجام شد ✅ به سایت برگردید و دوره را ببینید.');
        }
    }
}

export async function handleBaleUpdate(update) {
    if (update?.pre_checkout_query) return handlePreCheckout(update.pre_checkout_query);
    if (update?.message?.successful_payment) return handleSuccessfulPayment(update.message);
    if (update?.message?.text) return handleStartMessage(update.message);
}

// --------------------------------------------------------- missed-webhook sync

/**
 * Safety net used by the return page: if the customer paid but our webhook
 * never arrived, ask Bale about the transaction. Returns true when the order
 * is (now) paid.
 */
export async function syncBaleOrder(order) {
    if (order.status === 'paid') return true;
    if (order.status !== 'pending' || !order.transactionId) return false;

    try {
        const result = await baleApi.inquireTransaction(order.transactionId);
        const status = String(result?.status || '').toLowerCase();
        if (status !== 'paid') return false;
        if (result?.amount != null && Number(result.amount) !== toRial(order.amount)) {
            console.error('Bale inquireTransaction amount mismatch — review manually:', order.authority);
            return false;
        }
        await confirmPaid(order, result?.id || order.transactionId);
        return true;
    } catch (error) {
        console.error('Bale inquireTransaction failed:', error?.message);
        return false;
    }
}
