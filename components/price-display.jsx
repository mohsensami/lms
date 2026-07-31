import { formatPrice, hasActiveDiscount } from '@/lib/formatPrice';
import { cn } from '@/lib/utils';

export function PriceDisplay({ course, className, priceClassName, originalClassName }) {
    const discounted = hasActiveDiscount(course);

    if (!discounted) {
        return <span className={cn('font-bold text-primary', priceClassName, className)}>{formatPrice(course?.price)}</span>;
    }

    return (
        <span className={cn('flex flex-wrap items-center gap-2', className)}>
            <span className={cn('text-sm font-medium text-red-500 line-through', originalClassName)}>
                {formatPrice(course?.price)}
            </span>
            <span className={cn('font-bold text-green-600', priceClassName)}>{formatPrice(course?.discountPrice)}</span>
        </span>
    );
}
