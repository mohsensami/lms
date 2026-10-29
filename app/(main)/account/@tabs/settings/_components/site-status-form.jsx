'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { saveSiteStatus } from '@/app/actions/settings';
import { DEFAULT_MAINTENANCE_MESSAGE, MAX_MAINTENANCE_MESSAGE_LENGTH } from '@/lib/site-status-defaults';

export default function SiteStatusForm({ initial }) {
    const router = useRouter();
    const [maintenance, setMaintenance] = useState(initial.maintenance.enabled);
    const [message, setMessage] = useState(initial.maintenance.message);
    const [closed, setClosed] = useState(initial.closed);
    const [isSaving, startSaving] = useTransition();

    const dirty =
        maintenance !== initial.maintenance.enabled ||
        message.trim() !== initial.maintenance.message ||
        closed !== initial.closed;

    function handleSave() {
        startSaving(async () => {
            const result = await saveSiteStatus({ maintenance: { enabled: maintenance, message }, closed });
            if (result.ok) {
                toast.success(result.message);
                setMessage(result.status.maintenance.message);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Maintenance mode */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h5 className="font-semibold text-foreground">حالت تعمیر سایت</h5>
                        <p className="mt-1 text-sm text-muted-foreground">
                            با فعال بودن، یک نوار هشدار ثابت در بالای همه‌ی صفحه‌های سایت نمایش داده می‌شود. سایت همچنان قابل
                            استفاده است.
                        </p>
                    </div>
                    <Switch checked={maintenance} onCheckedChange={setMaintenance} disabled={isSaving} aria-label="حالت تعمیر" />
                </div>

                <div className="mt-4 space-y-2">
                    <Label htmlFor="maintenance-message">متن نوار هشدار</Label>
                    <Textarea
                        id="maintenance-message"
                        rows={2}
                        maxLength={MAX_MAINTENANCE_MESSAGE_LENGTH}
                        value={message}
                        disabled={isSaving}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={DEFAULT_MAINTENANCE_MESSAGE}
                    />
                    <p className="text-xs text-muted-foreground">اگر خالی بماند، متن «{DEFAULT_MAINTENANCE_MESSAGE}» نمایش داده می‌شود.</p>
                </div>

                <div className="mt-4">
                    <p className="mb-2 text-xs text-muted-foreground">پیش‌نمایش:</p>
                    <div
                        className={`flex items-center justify-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-amber-950 ${maintenance ? '' : 'opacity-40'}`}
                    >
                        <TriangleAlert className="h-4 w-4 shrink-0" />
                        <span>{message.trim() || DEFAULT_MAINTENANCE_MESSAGE}</span>
                    </div>
                </div>
            </div>

            {/* Closed site */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h5 className="flex items-center gap-2 font-semibold text-foreground">
                            <Lock className="h-4 w-4" />
                            غیرفعال کردن سایت
                        </h5>
                        <p className="mt-1 text-sm text-muted-foreground">
                            با فعال بودن، فقط کاربرانی که وارد حساب خود شده‌اند می‌توانند صفحه‌های سایت را ببینند. بازدیدکننده‌های
                            مهمان فقط به صفحه‌های ورود و ثبت‌نام دسترسی دارند و بقیه‌ی آدرس‌ها آن‌ها را به صفحه‌ی ورود می‌برند.
                        </p>
                    </div>
                    <Switch checked={closed} onCheckedChange={setClosed} disabled={isSaving} aria-label="غیرفعال کردن سایت" />
                </div>

                {closed && (
                    <Alert variant="destructive" className="mt-4">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>توجه</AlertTitle>
                        <AlertDescription>
                            بعد از ذخیره، مهمان‌ها نمی‌توانند دوره‌ها، وبلاگ و صفحه‌ی اصلی را ببینند. شما چون وارد حساب خود
                            هستید دسترسی دارید؛ اگر از حساب خارج شوید فقط از مسیر «ورود» می‌توانید برگردید.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <Button onClick={handleSave} disabled={!dirty || isSaving}>
                {isSaving && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
                ذخیره‌ی وضعیت سایت
            </Button>
        </div>
    );
}
