import { requireRole } from '@/lib/require-role';
import { getCertificateRequestsForReview } from '@/queries/certificateRequests';
import { Badge } from '@/components/ui/badge';
import CertificateRequestActions from './_components/certificate-request-actions';

const STATUS_LABEL = {
    pending: 'در انتظار بررسی',
    approved: 'تایید شده',
    rejected: 'رد شده',
};

const STATUS_VARIANT = {
    pending: 'secondary',
    approved: 'success',
    rejected: 'destructive',
};

const CertificateRequestsPage = async () => {
    const user = await requireRole('instructor');
    const requests = await getCertificateRequestsForReview(user);

    return (
        <div className="p-6">
            <div className="flex flex-col gap-4">
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <div key={request.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h6 className="font-semibold text-foreground">
                                        {request?.course?.title || 'دوره حذف شده'}
                                    </h6>
                                    <span className="text-xs text-muted-foreground">
                                        {request?.student?.firstName} {request?.student?.lastName} (
                                        {request?.student?.email})
                                    </span>
                                </div>
                                <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABEL[request.status]}</Badge>
                            </div>

                            {request.status === 'pending' && (
                                <div className="mt-4">
                                    <CertificateRequestActions requestId={request.id} courseId={request.courseId} />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="font-bold bg-red-400 text-white p-2 w-100">هیچ درخواست مدرکی ثبت نشده است!</div>
                )}
            </div>
        </div>
    );
};

export default CertificateRequestsPage;
