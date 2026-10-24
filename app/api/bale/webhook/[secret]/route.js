import { handleBaleUpdate, verifyWebhookSecret } from '@/lib/payments/bale';

export const dynamic = 'force-dynamic';

/**
 * Bale calls this URL for every update of the payment bot. Bale does not sign
 * requests, so the shared secret in the path (BALE_WEBHOOK_SECRET) is what
 * proves the call is genuine. Register it from Settings -> Payments.
 */
export async function POST(request, { params }) {
    const { secret } = await params;

    if (!verifyWebhookSecret(secret)) {
        return Response.json({ ok: false }, { status: 403 });
    }

    let update;
    try {
        update = await request.json();
    } catch {
        return Response.json({ ok: false }, { status: 400 });
    }

    try {
        await handleBaleUpdate(update);
    } catch (error) {
        // Still answer 200 — Bale would otherwise keep re-sending the update.
        console.error('Bale webhook error:', error);
    }

    return Response.json({ ok: true });
}
