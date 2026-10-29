'use client';

import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Check, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveExam } from '@/app/actions/exam';
import { EXAM_OPTION_COUNT, EXAM_OPTION_LABELS, EXAM_RETRY_LOCK_DAYS } from '@/lib/exam-constants';
import { cn } from '@/lib/utils';

const questionSchema = z.object({
    text: z.string().trim().min(1, 'متن سوال الزامی است'),
    options: z.array(z.string().trim().min(1, 'متن گزینه الزامی است')).length(EXAM_OPTION_COUNT),
    correctIndex: z.number().int().min(0).max(EXAM_OPTION_COUNT - 1),
});

const formSchema = z
    .object({
        courseId: z.string().min(1, 'دوره را انتخاب کنید'),
        title: z.string().trim().min(1, 'عنوان آزمون الزامی است'),
        description: z.string().optional(),
        durationMinutes: z
            .number({ invalid_type_error: 'زمان آزمون را وارد کنید' })
            .int('عدد صحیح وارد کنید')
            .min(1, 'حداقل ۱ دقیقه')
            .max(600, 'حداکثر ۶۰۰ دقیقه'),
        requiredCorrect: z
            .number({ invalid_type_error: 'تعداد پاسخ درست را وارد کنید' })
            .int('عدد صحیح وارد کنید')
            .min(1, 'حداقل ۱'),
        active: z.boolean(),
        questions: z.array(questionSchema).min(1, 'حداقل یک سوال لازم است'),
    })
    .refine((v) => v.requiredCorrect <= v.questions.length, {
        path: ['requiredCorrect'],
        message: 'از تعداد سوال‌ها بیشتر است',
    });

const emptyQuestion = () => ({ text: '', options: Array(EXAM_OPTION_COUNT).fill(''), correctIndex: 0 });

export function ExamForm({ exam, courseOptions }) {
    const router = useRouter();
    const isEdit = Boolean(exam?.id);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            courseId: exam?.courseId ?? '',
            title: exam?.title ?? '',
            description: exam?.description ?? '',
            durationMinutes: exam?.durationMinutes ?? 30,
            requiredCorrect: exam?.requiredCorrect ?? 1,
            active: exam?.active ?? false,
            questions: exam?.questions?.length
                ? exam.questions.map((q) => ({ text: q.text, options: q.options, correctIndex: q.correctIndex }))
                : [emptyQuestion()],
        },
    });

    const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'questions' });
    const { isSubmitting } = form.formState;
    const questionCount = form.watch('questions')?.length ?? 0;

    async function onSubmit(values) {
        const res = await saveExam(values, exam?.id);
        if (!res?.ok) {
            toast.error(res?.error || 'مشکلی پیش آمد');
            return;
        }
        toast.success(isEdit ? 'آزمون ذخیره شد' : 'آزمون ایجاد شد');
        router.push('/account/exams');
        router.refresh();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">مشخصات آزمون</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="courseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>دوره</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="یک دوره انتخاب کنید" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {courseOptions.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>هر دوره فقط یک آزمون دارد.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>عنوان آزمون</FormLabel>
                                    <FormControl>
                                        <Input placeholder="مثلاً: آزمون پایانی دوره متلب" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="durationMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>مدت زمان آزمون (دقیقه)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="requiredCorrect"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>حداقل پاسخ درست برای قبولی</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={questionCount || undefined}
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        از مجموع {questionCount.toLocaleString('fa-IR')} سوال. در صورت عدم قبولی یا اتمام زمان،
                                        دانشجو {EXAM_RETRY_LOCK_DAYS.toLocaleString('fa-IR')} روز قفل می‌شود.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>توضیحات (اختیاری)</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder="توضیحی که پیش از شروع آزمون به دانشجو نشان داده می‌شود" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0 md:col-span-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">منتشر شود (برای دانشجوها قابل شرکت باشد)</FormLabel>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">سوال‌ها ({questionCount.toLocaleString('fa-IR')})</h2>
                    </div>

                    {fields.map((item, index) => (
                        <Card key={item.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-base">سوال {(index + 1).toLocaleString('fa-IR')}</CardTitle>
                                <div className="flex items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, index - 1)}>
                                        <ArrowUp />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === fields.length - 1}
                                        onClick={() => move(index, index + 1)}
                                    >
                                        <ArrowDown />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        disabled={fields.length === 1}
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.text`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>متن سوال</FormLabel>
                                            <FormControl>
                                                <Textarea rows={2} placeholder="متن سوال را وارد کنید" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <p className="text-sm font-medium">گزینه‌ها (روی ✓ بزنید تا گزینه‌ی صحیح مشخص شود)</p>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {EXAM_OPTION_LABELS.map((label, optIndex) => {
                                            const isCorrect = form.watch(`questions.${index}.correctIndex`) === optIndex;
                                            return (
                                                <FormField
                                                    key={optIndex}
                                                    control={form.control}
                                                    name={`questions.${index}.options.${optIndex}`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant={isCorrect ? 'default' : 'outline'}
                                                                    className={cn('shrink-0', isCorrect && 'bg-success text-success-foreground hover:bg-success/90')}
                                                                    title="گزینه‌ی صحیح"
                                                                    onClick={() =>
                                                                        form.setValue(`questions.${index}.correctIndex`, optIndex, { shouldDirty: true })
                                                                    }
                                                                >
                                                                    {isCorrect ? <Check /> : <span className="text-xs">{label}</span>}
                                                                </Button>
                                                                <FormControl>
                                                                    <Input placeholder={`گزینه ${label}`} {...field} />
                                                                </FormControl>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {form.formState.errors.questions?.message && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.questions.message}</p>
                    )}

                    <Button type="button" variant="outline" className="w-full gap-2 border-dashed" onClick={() => append(emptyQuestion())}>
                        <PlusCircle /> افزودن سوال
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'در حال ذخیره...' : isEdit ? 'ذخیره‌ی تغییرات' : 'ایجاد آزمون'}
                    </Button>
                    <Button asChild variant="outline" type="button">
                        <Link href="/account/exams">انصراف</Link>
                    </Button>
                </div>
            </form>
        </Form>
    );
}
