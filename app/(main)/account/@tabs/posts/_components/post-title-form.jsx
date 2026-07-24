'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePost } from '@/app/actions/post';
import { toast } from 'sonner';

const formSchema = z.object({
    title: z.string().min(1, {
        message: 'عنوان الزامی است',
    }),
});

export const PostTitleForm = ({ initialData, postId }) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { title: initialData?.title || '' },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values) => {
        try {
            await updatePost(postId, values);
            toggleEdit();
            router.refresh();
            toast.success('عنوان پست به‌روزرسانی شد');
        } catch (error) {
            toast.error('مشکلی پیش آمد');
        }
    };

    return (
        <div className="mt-6 border bg-gray-50 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                عنوان پست
                <Button variant="ghost" onClick={toggleEdit}>
                    {isEditing ? (
                        <>انصراف</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            ویرایش عنوان
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && <p className="text-sm mt-2">{initialData?.title}</p>}
            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input disabled={isSubmitting} placeholder="عنوان پست" {...field} />
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
