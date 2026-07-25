'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePost } from '@/app/actions/post';
import { toast } from 'sonner';
import { getSlug } from '@/lib/convertData';
import { SITE_URL } from '@/lib/seo';

const formSchema = z.object({
    slug: z
        .string()
        .min(1, { message: 'نامک (slug) الزامی است' })
        .regex(/^[a-z0-9\u0600-\u06FF-]+$/i, {
            message: 'نامک فقط می‌تواند شامل حروف، عدد و خط تیره باشد (بدون فاصله)',
        }),
});

export const PostSlugForm = ({ initialData, postId }) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { slug: initialData?.slug || '' },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values) => {
        try {
            await updatePost(postId, { slug: getSlug(values.slug) });
            toggleEdit();
            router.refresh();
            toast.success('نامک پست به‌روزرسانی شد');
        } catch (error) {
            toast.error(
                String(error?.message || '').includes('Unique constraint')
                    ? 'این نامک قبلاً برای پست دیگری استفاده شده است.'
                    : 'مشکلی پیش آمد',
            );
        }
    };

    return (
        <div className="mt-6 border bg-gray-50 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                نامک (Slug)
                <Button variant="ghost" onClick={toggleEdit}>
                    {isEditing ? (
                        <>انصراف</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            ویرایش نامک
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p className="text-sm mt-2 break-all" dir="ltr">
                    {SITE_URL}/blog/{initialData?.slug}
                </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input dir="ltr" disabled={isSubmitting} placeholder="my-post-slug" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        ⚠️ توجه: تغییر نامک باعث می‌شود لینک‌های قبلی این پست دیگر کار نکنند.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
