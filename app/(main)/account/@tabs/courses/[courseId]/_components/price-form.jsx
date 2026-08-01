'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice, hasActiveDiscount } from '@/lib/formatPrice';
import { formatJalaliDateTime } from '@/lib/jalali';
import { JalaliDateTimePicker } from '@/components/jalali-datetime-picker';
import { cn } from '@/lib/utils';
import { Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateCourse } from '@/app/actions/course';

const formSchema = z
    .object({
        price: z.coerce.number().min(0, { message: 'قیمت نمی‌تواند منفی باشد' }),
        discountPrice: z
            .union([z.coerce.number(), z.literal('')])
            .optional()
            .transform((v) => (v === '' ? null : v)),
    })
    .refine((data) => data.discountPrice == null || data.discountPrice < data.price, {
        message: 'قیمت با تخفیف باید کمتر از قیمت اصلی باشد',
        path: ['discountPrice'],
    });

export const PriceForm = ({ initialData, courseId }) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [discountEndsAt, setDiscountEndsAt] = useState(initialData?.discountEndsAt ?? null);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: initialData?.price ?? undefined,
            discountPrice: initialData?.discountPrice ?? '',
        },
    });

    const { isSubmitting, isValid, watch } = form.formState;
    const discountPriceValue = form.watch('discountPrice');

    const onSubmit = async (values) => {
        try {
            await updateCourse(courseId, {
                ...values,
                // No discount price set at all -> also clear the expiry date,
                // so we never end up with a dangling date and no discount.
                discountEndsAt: values.discountPrice ? discountEndsAt : null,
            });
            toast.success('Course updated');
            toggleEdit();
            router.refresh();
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const discounted = hasActiveDiscount(initialData);

    return (
        <div className="mt-6 border bg-gray-50 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                قیمت دوره
                <Button variant="ghost" onClick={toggleEdit}>
                    {isEditing ? (
                        <>انصراف</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            ویرایش قیمت
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <div className={cn('text-sm mt-2', !initialData.price && 'text-slate-500 italic')}>
                    {initialData.price ? (
                        discounted ? (
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2">
                                    <span className="text-red-500 line-through">{formatPrice(initialData.price)}</span>
                                    <span className="font-bold text-green-600">
                                        {formatPrice(initialData.discountPrice)}
                                    </span>
                                </span>
                                {initialData.discountEndsAt && (
                                    <span className="text-xs text-muted-foreground">
                                        پایان تخفیف: {formatJalaliDateTime(initialData.discountEndsAt)}
                                    </span>
                                )}
                            </div>
                        ) : (
                            formatPrice(initialData.price)
                        )
                    ) : (
                        'No price'
                    )}
                </div>
            )}
            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">قیمت اصلی (تومان)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            placeholder="Set a price for your course"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">قیمت با تخفیف (اختیاری)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            placeholder="خالی بگذارید یعنی بدون تخفیف"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {discountPriceValue !== '' && discountPriceValue != null && (
                            <div>
                                <Label className="text-xs">تاریخ و ساعت پایان تخفیف (اختیاری)</Label>
                                <p className="mb-2 text-[11px] text-muted-foreground">
                                    اگر خالی بماند، تخفیف تا زمانی که خودتان دستی حذفش کنید فعال می‌ماند.
                                </p>
                                <div className="flex items-center gap-2">
                                    <JalaliDateTimePicker
                                        value={discountEndsAt}
                                        onChange={setDiscountEndsAt}
                                        disabled={isSubmitting}
                                    />
                                    {discountEndsAt && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setDiscountEndsAt(null)}
                                            title="حذف تاریخ پایان"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-x-2">
                            <Button disabled={!isValid || isSubmitting} type="submit">
                                ذخیره
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};
