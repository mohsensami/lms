import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { requireRole } from '@/lib/require-role';
import { getAllExams } from '@/queries/exams';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExamRowActions } from './_components/exam-row-actions';

const ExamsPage = async () => {
    await requireRole('admin');
    const exams = await getAllExams();
    const fa = (n) => Number(n).toLocaleString('fa-IR');

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold">آزمون‌ها</h1>
                <Button asChild className="gap-2">
                    <Link href="/account/exams/add">
                        <PlusCircle /> ساخت آزمون
                    </Link>
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-start">عنوان</TableHead>
                            <TableHead className="text-start">دوره</TableHead>
                            <TableHead className="text-start">سوال‌ها</TableHead>
                            <TableHead className="text-start">زمان</TableHead>
                            <TableHead className="text-start">حداقل درست</TableHead>
                            <TableHead className="text-start">تلاش‌ها</TableHead>
                            <TableHead className="text-start">وضعیت</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {exams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    هنوز آزمونی ساخته نشده است.
                                </TableCell>
                            </TableRow>
                        ) : (
                            exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell>{exam.course?.title ?? '—'}</TableCell>
                                    <TableCell>{fa(exam._count.questions)}</TableCell>
                                    <TableCell>{fa(exam.durationMinutes)} دقیقه</TableCell>
                                    <TableCell>{fa(exam.requiredCorrect)}</TableCell>
                                    <TableCell>{fa(exam._count.attempts)}</TableCell>
                                    <TableCell>
                                        <Badge variant={exam.active ? 'success' : 'secondary'}>{exam.active ? 'منتشر شده' : 'پیش‌نویس'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ExamRowActions examId={exam.id} active={exam.active} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ExamsPage;
