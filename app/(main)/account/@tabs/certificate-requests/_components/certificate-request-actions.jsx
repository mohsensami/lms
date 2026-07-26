'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { approveCertificateRequest, rejectCertificateRequest } from '@/app/actions/certificate-request';

function CertificateRequestActions({ requestId, courseId }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handle = (action, successMessage) => {
        startTransition(async () => {
            try {
                await action(requestId, courseId);
                toast.success(successMessage);
                router.refresh();
            } catch (error) {
                toast.error(error?.message || 'مشکلی پیش آمد');
            }
        });
    };

    return (
        <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={() => handle(approveCertificateRequest, 'مدرک تایید شد')}>
                تایید مدرک
            </Button>
            <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => handle(rejectCertificateRequest, 'درخواست رد شد')}
            >
                رد کردن
            </Button>
        </div>
    );
}

export default CertificateRequestActions;
