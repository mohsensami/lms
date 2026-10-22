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
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { PostContentField } from './post-content-field';
import { PostPublishPicker } from './post-publish-picker';
import { buildPublishPayload } from '@/lib/post-status';
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
    const [publish, setPublish] = useState({ mode: 'now', date: null });
    const [thumbnail, setThumbnail] = useState(null);
    const [isThumbUploading, setIsThumbUploading] = useState(false);

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
            const post = await createPost({
                ...values,
                slug: getSlug(values.slug),
                thumbnail,
                ...buildPublishPayload(publish),
            });
            toast.success('پست ایجاد شد');
            router.push(`/account/posts/${post?.id}`);
        } catch (error) {
            if (error?.message === 'تاریخ و ساعت انتشار معتبر نیست') {
                toast.error(error.message);
                return;
            }
            toast.error(
                String(error?.message || '').includes('Unique constraint')
                    ? 'این نامک (slug) قبلاً برای پست دیگری استفاده شده است. لطفاً نامک دیگری انتخاب کنید.'
                    : 'مشکلی پیش آمد',
            );
        }
    };

    return (
        <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
            <div className="max-w-full w-[680px]">
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
                                        <PostContentField field={field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormDescription>
                                        می‌توانید متن ساده یا HTML بنویسید. با «افزودن تصویر» عکس آپلود و در جای مکان‌نما
                                        درج می‌شود و با «افزودن کد متلب» کد با رنگ‌بندی (Prism) نمایش داده می‌شود.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <FormLabel>تصویر شاخص (اختیاری)</FormLabel>
                                    <UploadButton
                                        endpoint="postImageUploader"
                                        disabled={isSubmitting}
                                        onUploadBegin={() => setIsThumbUploading(true)}
                                        onClientUploadComplete={(res) => {
                                            setIsThumbUploading(false);
                                            const uploaded = res?.[0]?.ufsUrl ?? res?.[0]?.url;
                                            if (!uploaded) {
                                                toast.error('آپلود تصویر با مشکل مواجه شد');
                                                return;
                                            }
                                            setThumbnail(uploaded);
                                        }}
                                        onUploadError={(error) => {
                                            setIsThumbUploading(false);
                                            toast.error(`خطا در آپلود تصویر: ${error.message}`);
                                        }}
                                        appearance={{
                                            button: 'ut-uploading:cursor-not-allowed ut-uploading:opacity-70 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium after:hidden',
                                            allowedContent: 'hidden',
                                        }}
                                        content={{
                                            button: ({ isUploading }) => (isUploading ? 'در حال آپلود...' : 'آپلود تصویر'),
                                        }}
                                    />
                                </div>
                                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md bg-slate-200">
                                    {thumbnail ? (
                                        <Image alt="تصویر شاخص" fill className="object-cover" src={thumbnail} />
                                    ) : (
                                        <ImageIcon className="h-10 w-10 text-slate-500" />
                                    )}
                                    {isThumbUploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        <div className="space-y-2">
                            <FormLabel>انتشار</FormLabel>
                            <PostPublishPicker value={publish} onChange={setPublish} disabled={isSubmitting} />
                        </div>
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
