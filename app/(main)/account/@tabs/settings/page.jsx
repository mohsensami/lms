import { requireRole } from '@/lib/require-role';
import { PROVIDERS, getActiveProviderId, getMissingEnv } from '@/lib/storage';
import { getPrimaryColor } from '@/lib/site-theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StorageSettingsForm from './_components/storage-settings-form';
import ThemeSettingsForm from './_components/theme-settings-form';
import PaymentSettingsForm from './_components/payment-settings-form';
import { GATEWAYS, getMissingGatewayEnv } from '@/lib/payments/gateways';
import { getSelectedGatewayIds } from '@/lib/payments/settings';
import { BALE_TEST_PROVIDER_TOKEN, getBaleMode } from '@/lib/payments/bale';

export const dynamic = 'force-dynamic';

const SettingsPage = async () => {
    await requireRole('admin');

    const [activeProvider, primaryColor, selectedGateways] = await Promise.all([
        getActiveProviderId(),
        getPrimaryColor(),
        getSelectedGatewayIds(),
    ]);

    // Names of missing env variables only — never their values.
    const gateways = Object.values(GATEWAYS).map((gateway) => {
        const missing = getMissingGatewayEnv(gateway.id);
        return {
            id: gateway.id,
            label: gateway.label,
            description: gateway.description,
            configured: missing.length === 0,
            missing,
        };
    });

    // Only plain, non-secret info is sent to the client: which provider is
    // ready, and the NAMES (not values) of any missing env variables.
    const providers = Object.values(PROVIDERS).map((provider) => {
        const missing = getMissingEnv(provider.id);
        return {
            id: provider.id,
            label: provider.label,
            description: provider.description,
            secure: provider.secure,
            supportsCors: provider.type === 's3',
            configured: missing.length === 0,
            missing,
        };
    });

    return (
        <div className="p-6">
            <h4 className="mb-1 text-xl font-bold text-foreground">تنظیمات سایت</h4>
            <p className="mb-6 text-sm text-muted-foreground">ظاهر سایت، درگاه‌های پرداخت و محل ذخیره‌ی ویدیوها را مدیریت کنید.</p>

            <Tabs defaultValue="appearance">
                <TabsList className="mb-6">
                    <TabsTrigger value="appearance">ظاهر سایت</TabsTrigger>
                    <TabsTrigger value="payments">درگاه‌های پرداخت</TabsTrigger>
                    <TabsTrigger value="storage">ذخیره‌سازی ویدیو</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance">
                    <ThemeSettingsForm savedColor={primaryColor} />
                </TabsContent>

                <TabsContent value="payments">
                    <PaymentSettingsForm
                        gateways={gateways}
                        savedIds={selectedGateways}
                        zarinpalSandbox={process.env.ZARINPAL_SANDBOX !== 'false'}
                        baleMode={getBaleMode()}
                        baleTestToken={process.env.BALE_PROVIDER_TOKEN === BALE_TEST_PROVIDER_TOKEN}
                    />
                </TabsContent>

                <TabsContent value="storage">
                    <p className="mb-5 text-sm text-muted-foreground">
                        ویدیوهای قبلی همچنان از جایی که آپلود شده‌اند پخش می‌شوند؛ فقط آپلودهای جدید در سرویس انتخاب‌شده
                        ذخیره می‌شوند.
                    </p>
                    <StorageSettingsForm providers={providers} activeProvider={activeProvider} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
