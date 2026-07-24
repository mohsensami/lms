'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updatePost } from '@/app/actions/post';

const formSchema = z.object({
    content: z.string().min(1, {
        message: 'متن پست الزامی است',
    }),
});

export const PostContentForm = ({ initialData, postId }) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { content: initialData?.content || '' },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values) => {
        try {
            await updatePost(postId, values);
            toast.success('متن پست به‌روزرسانی شد');
            toggleEdit();
            router.refresh();
        } catch (error) {
            toast.error('مشکلی پیش آمد');
        }
    };

    return (
        <div className="mt-6 border bg-gray-50 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                متن پست
                <Button variant="ghost" onClick={toggleEdit}>
                    {isEditing ? (
                        <>انصراف</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            ویرایش متن
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p className={cn('text-sm mt-2 whitespace-pre-line', !initialData?.content && 'text-slate-500 italic')}>
                    {initialData?.content || 'بدون متن'}
                </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea rows={10} disabled={isSubmitting} placeholder="متن کامل مقاله" {...field} />
                                    </FormControl>
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
