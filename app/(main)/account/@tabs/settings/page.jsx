import { requireRole } from '@/lib/require-role';
import { PROVIDERS, getActiveProviderId, getMissingEnv } from '@/lib/storage';
import StorageSettingsForm from './_components/storage-settings-form';

export const dynamic = 'force-dynamic';

const SettingsPage = async () => {
    await requireRole('admin');

    const activeProvider = await getActiveProviderId();

    // Only plain, non-secret info is sent to the client: which provider is
    // ready, and the NAMES (not values) of any missing env variables.
    const providers = Object.values(PROVIDERS).map((provider) => {
        const missing = getMissingEnv(provider.id);
        return {
            id: provider.id,
            label: provider.label,
            description: provider.description,
            configured: missing.length === 0,
            missing,
        };
    });

    return (
        <div className="p-6">
            <h4 className="mb-1 text-xl font-bold text-foreground">تنظیمات سایت</h4>
            <p className="mb-6 text-sm text-muted-foreground">
                محل ذخیره‌ی ویدیوهای دوره‌ها را مشخص کنید. ویدیوهای قبلی همچنان از جایی که آپلود شده‌اند پخش می‌شوند؛ فقط
                آپلودهای جدید در سرویس انتخاب‌شده ذخیره می‌شوند.
            </p>

            <StorageSettingsForm providers={providers} activeProvider={activeProvider} />
        </div>
    );
};

export default SettingsPage;
