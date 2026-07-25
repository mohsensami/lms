'use client';
import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createPost } from '@/app/actions/post';
import { getSlug } from '@/lib/convertData';

const formSchema = z.object({
    title: z.string().min(1, {
        message: 'عنوان الزامی است',
    }),
    slug: z
        .string()
        .min(1, { message: 'نامک (slug) الزامی است' })
        .regex(/^[a-z0-9\u0600-\u06FF-]+$/i, {
            message: 'نامک فقط می‌تواند شامل حروف، عدد و خط تیره باشد (بدون فاصله)',
        }),
    content: z.string().min(1, {
        message: 'متن پست الزامی است',
    }),
});

const AddPostForm = () => {
    const router = useRouter();
    // Once the admin edits the slug field by hand, stop overwriting it from
    // the title — otherwise their manual English slug would keep getting
    // clobbered on every keystroke in the title field.
    const [slugTouched, setSlugTouched] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            slug: '',
            content: '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const handleTitleChange = (field) => (e) => {
        field.onChange(e);
        if (!slugTouched) {
            form.setValue('slug', getSlug(e.target.value) || '', { shouldValidate: true });
        }
    };

    const handleSlugChange = (field) => (e) => {
        setSlugTouched(true);
        field.onChange(e);
    };

    const onSubmit = async (values) => {
        try {
            const post = await createPost({ ...values, slug: getSlug(values.slug) });
            toast.success('پست ایجاد شد');
            router.push(`/account/posts/${post?.id}`);
        } catch (error) {
            toast.error(
                String(error?.message || '').includes('Unique constraint')
                    ? 'این نامک (slug) قبلاً برای پست دیگری استفاده شده است. لطفاً نامک دیگری انتخاب کنید.'
                    : 'مشکلی پیش آمد',
            );
        }
    };

    return (
        <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
            <div className="max-w-full w-[536px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>عنوان پست</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="مثلا: چطور اولین پروژه ری‌اکت خودتون رو بسازید"
                                            {...field}
                                            onChange={handleTitleChange(field)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>نامک (Slug) — آدرس صفحه</FormLabel>
                                    <FormControl>
                                        <Input
                                            dir="ltr"
                                            disabled={isSubmitting}
                                            placeholder="my-first-react-project"
                                            {...field}
                                            onChange={handleSlugChange(field)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        پیشنهاد می‌شود از حروف انگلیسی و خط تیره استفاده کنید (مثلاً{' '}
                                        <span dir="ltr" className="font-mono">
                                            intro-to-simulink
                                        </span>
                                        ) تا آدرس صفحه کوتاه‌تر و در همه‌جا (مثل اشتراک‌گذاری در تلگرام/واتساپ) بدون
                                        مشکل نمایش داده شود. آدرس نهایی: <span dir="ltr">/blog/{field.value || '...'}</span>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>متن پست</FormLabel>
                                    <FormControl>
                                        <Textarea rows={10} placeholder="متن کامل مقاله" className="resize-none" {...field} />
                                    </FormControl>
                                    <FormDescription>می‌توانید بعداً تصویر شاخص پست را هم اضافه کنید</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Link href="/account/posts">
                                <Button variant="outline" type="button">
                                    انصراف
                                </Button>
                            </Link>
                            <Button type="submit" disabled={!isValid || isSubmitting}>
                                ادامه
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default AddPostForm;
