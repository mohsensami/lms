'use client';
import * as z from 'zod';
// import axios from "axios";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createCourse } from '@/app/actions/course';

const formSchema = z.object({
    title: z.string().min(1, {
        message: 'Title is required!',
    }),
    description: z.string().min(1, {
        message: 'Description is required!',
    }),
});

const AddCourse = () => {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values) => {
        try {
            const course = await createCourse(values);
            router.push(`/dashboard/courses/${course?._id}`);
            toast.success('دوره ایجاد شد');
        } catch (error) {
            toast.error('Something went wrong');
        }
        console.log(values);
    };
    return (
        <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
            <div className="max-w-full w-[536px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
                        {/* title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>نام دوره</FormLabel>
                                    <FormControl>
                                        <Input disabled={isSubmitting} placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>توضیحات دوره</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="" className="resize-none" {...field} />
                                    </FormControl>
                                    <FormDescription>شرح مختصری از دوره خود بنویسید</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Link href="/dashboard/courses">
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

export default AddCourse;
