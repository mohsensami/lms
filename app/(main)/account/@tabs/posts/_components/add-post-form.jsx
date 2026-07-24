'use client';
import * as z from 'zod';
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

const formSchema = z.object({
    title: z.string().min(1, {
        message: 'عنوان الزامی است',
    }),
    content: z.string().min(1, {
        message: 'متن پست الزامی است',
    }),
});

const AddPostForm = () => {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values) => {
        try {
            const post = await createPost(values);
            toast.success('پست ایجاد شد');
            router.push(`/account/posts/${post?.id}`);
        } catch (error) {
            toast.error('مشکلی پیش آمد');
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
                                        <Input disabled={isSubmitting} placeholder="مثلا: چطور اولین پروژه ری‌اکت خودتون رو بسازید" {...field} />
                                    </FormControl>
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
