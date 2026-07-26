'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { requestCertificate } from '@/app/actions/certificate-request';

const STATUS_LABEL = {
    pending: 'در انتظار تایید',
    rejected: 'رد شده — می‌توانید دوباره درخواست دهید',
};

export const DownloadCertificate = ({ courseId, totalProgress, requestStatus }) => {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);

    async function handleRequest() {
        setIsBusy(true);
        try {
            await requestCertificate(courseId);
            toast.success('درخواست تایید مدرک ثبت شد');
            router.refresh();
        } catch (error) {
            toast.error(error.message || 'مشکلی پیش آمد');
        } finally {
            setIsBusy(false);
        }
    }

    async function handleDownload() {
        setIsBusy(true);
        try {
            const response = await fetch(`/api/certificate?courseId=${courseId}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Certificate.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            toast.error('دانلود مدرک با مشکل مواجه شد');
        } finally {
            setIsBusy(false);
        }
    }

    if (totalProgress < 100) {
        return (
            <Button size="sm" disabled>
                دانلود مدرک
            </Button>
        );
    }

    if (requestStatus === 'approved') {
        return (
            <Button onClick={handleDownload} disabled={isBusy} size="sm">
                دانلود مدرک
            </Button>
        );
    }

    if (requestStatus === 'pending' || requestStatus === 'rejected') {
        return (
            <div className="flex flex-col items-end gap-1.5">
                <Badge variant={requestStatus === 'pending' ? 'secondary' : 'destructive'}>
                    {STATUS_LABEL[requestStatus]}
                </Badge>
                {requestStatus === 'rejected' && (
                    <Button onClick={handleRequest} disabled={isBusy} size="sm" variant="outline">
                        ارسال درخواست مجدد
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Button onClick={handleRequest} disabled={isBusy} size="sm">
            درخواست تایید مدرک
        </Button>
    );
};
