import 'server-only';
import { getSetting } from '@/lib/settings';
import { DEFAULT_ENABLED_GATEWAYS, GATEWAYS, isGatewayConfigured, isKnownGateway } from '@/lib/payments/gateways';

/** Gateways the admin switched on in Settings (raw choice, configured or not). */
export async function getSelectedGatewayIds() {
    const setting = await getSetting('payments');
    const ids = Array.isArray(setting?.enabledGateways) ? setting.enabledGateways : DEFAULT_ENABLED_GATEWAYS;
    return ids.filter(isKnownGateway);
}

/** Gateways a customer may actually use right now: selected AND configured. */
export async function getEnabledGatewayIds() {
    const selected = await getSelectedGatewayIds();
    return selected.filter((id) => isGatewayConfigured(id));
}

export async function getEnabledGateways() {
    const ids = await getEnabledGatewayIds();
    return ids.map((id) => ({
        id,
        label: GATEWAYS[id].label,
        shortLabel: GATEWAYS[id].shortLabel,
        description: GATEWAYS[id].description,
    }));
}
