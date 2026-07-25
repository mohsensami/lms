'use client';

import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { createPostComment } from '@/app/actions/post-comment';

const formSchema = z.object({
    content: z.string().min(1, { message: 'متن دیدگاه الزامی است' }),
});

function PostCommentForm({ postId, loggedInUser }) {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { content: '' },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values) => {
        try {
            await createPostComment(values.content, postId);
            toast.success('دیدگاه شما ثبت شد و پس از تایید ادمین نمایش داده می‌شود');
            form.reset({ content: '' });
            setSubmitted(true);
            router.refresh();
        } catch (error) {
            toast.error('مشکلی در ثبت دیدگاه پیش آمد');
        }
    };

    if (!loggedInUser) {
        return (
            <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                برای ثبت دیدگاه ابتدا{' '}
                <Link href="/login" className="font-semibold text-primary underline">
                    وارد حساب کاربری خود
                </Link>{' '}
                شوید.
            </p>
        );
    }

    if (submitted) {
        return (
            <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                دیدگاه شما ثبت شد و در وضعیت «در حال بررسی» قرار دارد. پس از تایید ادمین در همین صفحه نمایش داده
                می‌شود.
            </p>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    disabled={isSubmitting}
                                    placeholder="دیدگاه خود را درباره‌ی این مقاله بنویسید..."
                                    rows={4}
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>دیدگاه شما پس از تایید ادمین برای عموم نمایش داده می‌شود.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    ثبت دیدگاه
                </Button>
            </form>
        </Form>
    );
}

export default PostCommentForm;
