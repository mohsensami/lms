import { formatPrice, hasActiveDiscount } from '@/lib/formatPrice';
import { cn } from '@/lib/utils';
import { DiscountCountdown } from '@/components/discount-countdown';

export function PriceDisplay({ course, className, priceClassName, originalClassName, showCountdown = true }) {
    const discounted = hasActiveDiscount(course);

    if (!discounted) {
        return <span className={cn('font-bold text-primary', priceClassName, className)}>{formatPrice(course?.price)}</span>;
    }

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <span className="flex flex-wrap items-center gap-2">
                <span className={cn('text-sm font-medium text-red-500 line-through', originalClassName)}>
                    {formatPrice(course?.price)}
                </span>
                <span className={cn('font-bold text-green-600', priceClassName)}>{formatPrice(course?.discountPrice)}</span>
            </span>
            {showCountdown && course?.discountEndsAt && <DiscountCountdown endsAt={course.discountEndsAt} />}
        </div>
    );
}
