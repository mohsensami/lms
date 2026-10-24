// Registry of payment gateways the admin can enable (Settings -> Payments).
// Isomorphic on purpose (no secrets here): the settings page and the checkout
// dialog both read labels/descriptions from this file. Keys live in .env.

export const GATEWAYS = {
    zarinpal: {
        id: 'zarinpal',
        label: 'زرین‌پال',
        shortLabel: 'کارت‌های بانکی',
        description: 'پرداخت آنلاین با تمام کارت‌های بانکی عضو شتاب',
        envVars: ['ZARINPAL_MERCHANT'],
    },
    bale: {
        id: 'bale',
        label: 'بله (کیف پول بله)',
        shortLabel: 'کیف پول بله',
        description: 'پرداخت امن با کیف پول بله؛ پرداخت داخل پیام‌رسان بله انجام می‌شود',
        envVars: ['BALE_BOT_TOKEN', 'BALE_PROVIDER_TOKEN', 'BALE_BOT_USERNAME', 'BALE_WEBHOOK_SECRET'],
    },
};

export const DEFAULT_ENABLED_GATEWAYS = ['zarinpal'];

export function isKnownGateway(id) {
    return Object.prototype.hasOwnProperty.call(GATEWAYS, id);
}

/** Names of env variables still missing for a gateway (empty = ready to use). */
export function getMissingGatewayEnv(id, env = process.env) {
    const gateway = GATEWAYS[id];
    if (!gateway) return [];
    return gateway.envVars.filter((name) => !env[name]);
}

export function isGatewayConfigured(id, env = process.env) {
    return isKnownGateway(id) && getMissingGatewayEnv(id, env).length === 0;
}
