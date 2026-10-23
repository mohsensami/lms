import { requireRole } from '@/lib/require-role';
import { PROVIDERS, getActiveProviderId, getMissingEnv } from '@/lib/storage';
import { getPrimaryColor } from '@/lib/site-theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StorageSettingsForm from './_components/storage-settings-form';
import ThemeSettingsForm from './_components/theme-settings-form';

export const dynamic = 'force-dynamic';

const SettingsPage = async () => {
    await requireRole('admin');

    const [activeProvider, primaryColor] = await Promise.all([getActiveProviderId(), getPrimaryColor()]);

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
            <p className="mb-6 text-sm text-muted-foreground">ظاهر سایت و محل ذخیره‌ی ویدیوهای دوره‌ها را مدیریت کنید.</p>

            <Tabs defaultValue="appearance">
                <TabsList className="mb-6">
                    <TabsTrigger value="appearance">ظاهر سایت</TabsTrigger>
                    <TabsTrigger value="storage">ذخیره‌سازی ویدیو</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance">
                    <ThemeSettingsForm savedColor={primaryColor} />
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
