import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/formatPrice';
import { formatMyDate } from '@/lib/date';
import { Receipt } from 'lucide-react';
import Image from 'next/image';

const STATUS_LABEL = {
    paid: 'پرداخت شده',
    pending: 'در انتظار پرداخت',
    failed: 'پرداخت نشده',
};

const STATUS_VARIANT = {
    paid: 'success',
    pending: 'secondary',
    failed: 'destructive',
};

function OrderCard({ order, showBuyer }) {
    const course = order?.course;
    const status = order?.status || 'pending';

    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                {course?.thumbnail ? (
                    <Image
                        src={`/assets/images/courses/${course.thumbnail}`}
                        alt={course?.title || ''}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Receipt className="h-6 w-6" />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h6 className="truncate font-semibold text-foreground">{course?.title || 'دوره حذف شده'}</h6>
                {showBuyer && (
                    <span className="truncate text-sm text-foreground/80">
                        {order?.user?.firstName} {order?.user?.lastName} ({order?.user?.email})
                    </span>
                )}
                <span className="text-sm text-muted-foreground">{formatMyDate(order?.createdAt)}</span>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="font-bold text-foreground">{formatPrice(order?.amount)}</span>
                <Badge variant={STATUS_VARIANT[status] || 'secondary'}>{STATUS_LABEL[status] || status}</Badge>
            </div>
        </div>
    );
}

export default OrderCard;
