import { requireRole } from '@/lib/require-role';
import { prisma } from '@/lib/prisma';
import MessagesList from './_components/messages-list';
import EmailSwitches from '../../component/email-switch';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

const MessagesPage = async () => {
    await requireRole('admin');

    const { email } = await getSiteSettings();
    const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
    });

    // Only plain, serializable fields go to the client component.
    const items = messages.map((m) => ({
        id: m._id ?? m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
    }));

    return (
        <div className="p-6">
            <h4 className="mb-1 text-xl font-bold text-foreground">پیام‌های تماس با ما</h4>
            <p className="mb-6 text-sm text-muted-foreground">
                پیام‌هایی که بازدیدکنندگان از فرم «تماس با ما» می‌فرستند. می‌توانید آن‌ها را بخوانید، با ایمیل پاسخ بدهید یا حذف کنید.
            </p>
            <div className="mb-6">
                <EmailSwitches
                    title="ایمیل فرم تماس با ما"
                    items={[
                        {
                            key: 'contactEnabled',
                            label: 'ارسال ایمیل تأیید به فرستنده‌ی هر پیام',
                            description: 'اگر خاموش باشد، با ارسال پیام هیچ ایمیلی برای فرستنده نمی‌رود (پیام همچنان اینجا ذخیره می‌شود).',
                            initial: email.contactEnabled,
                        },
                        {
                            key: 'adminNotifyEnabled',
                            label: 'اعلان ایمیلی به مدیر برای هر پیام جدید',
                            description: 'گیرنده را در تنظیمات ← ایمیل‌ها مشخص کنید.',
                            initial: email.adminNotifyEnabled,
                        },
                    ]}
                />
            </div>
            <MessagesList initialItems={items} />
        </div>
    );
};

export default MessagesPage;
