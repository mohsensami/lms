'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/admin-guard';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { hasEnrollmentForCourse } from '@/queries/enrollments';
import { EXAM_OPTION_COUNT, EXAM_SUBMIT_GRACE_SECONDS } from '@/lib/exam-constants';
import { getExamStateForStudent, getQuestionsForStudent, lockUntilFor } from '@/lib/exam';
import { formatFaDate } from '@/lib/date';

// NOTE: server actions return `{ ok, ... }` instead of throwing, because in
// production Next.js hides the message of thrown errors from the browser.

/* -------------------------------------------------------------------------
 * Admin: create / edit / publish / delete exams
 * ---------------------------------------------------------------------- */

const questionSchema = z.object({
    text: z.string().trim().min(1, 'متن سوال الزامی است'),
    options: z
        .array(z.string().trim().min(1, 'متن گزینه الزامی است'))
        .length(EXAM_OPTION_COUNT, 'هر سوال باید دقیقاً ۴ گزینه داشته باشد'),
    correctIndex: z.number().int().min(0).max(EXAM_OPTION_COUNT - 1),
});

const examSchema = z
    .object({
        courseId: z.string().min(1, 'دوره را انتخاب کنید'),
        title: z.string().trim().min(1, 'عنوان آزمون الزامی است'),
        description: z.string().trim().optional().default(''),
        durationMinutes: z.number().int().min(1, 'زمان آزمون حداقل ۱ دقیقه است').max(600, 'زمان آزمون حداکثر ۶۰۰ دقیقه است'),
        requiredCorrect: z.number().int().min(1, 'حداقل تعداد پاسخ درست ۱ است'),
        active: z.boolean().optional().default(false),
        questions: z.array(questionSchema).min(1, 'حداقل یک سوال لازم است'),
    })
    .refine((v) => v.requiredCorrect <= v.questions.length, {
        path: ['requiredCorrect'],
        message: 'تعداد پاسخ درست لازم نمی‌تواند از تعداد سوال‌ها بیشتر باشد',
    });

function firstZodMessage(error) {
    return error?.issues?.[0]?.message || 'اطلاعات واردشده معتبر نیست';
}

async function requireAdmin() {
    try {
        await assertAdmin();
        return null;
    } catch {
        return { ok: false, error: 'فقط مدیران به این بخش دسترسی دارند.' };
    }
}

/** Creates a new exam, or updates the one with `examId`. */
export async function saveExam(input, examId) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const parsed = examSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstZodMessage(parsed.error) };
    const data = parsed.data;

    try {
        const course = await prisma.course.findUnique({ where: { id: data.courseId } });
        if (!course) return { ok: false, error: 'دوره‌ی انتخاب‌شده پیدا نشد.' };

        const sameCourse = await prisma.exam.findUnique({ where: { courseId: data.courseId } });
        if (sameCourse && sameCourse._id !== examId) {
            return { ok: false, error: 'برای این دوره قبلاً آزمون ساخته شده است. آن را ویرایش کنید.' };
        }

        const questionRows = data.questions.map((q, index) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            order: index,
        }));

        let savedId = examId;
        if (examId) {
            await prisma.$transaction(async (tx) => {
                await tx.exam.update({
                    where: { id: examId },
                    data: {
                        courseId: data.courseId,
                        title: data.title,
                        description: data.description || null,
                        durationMinutes: data.durationMinutes,
                        requiredCorrect: data.requiredCorrect,
                        active: data.active,
                    },
                });
                await tx.examQuestion.deleteMany({ where: { examId } });
                await tx.examQuestion.createMany({ data: questionRows.map((q) => ({ ...q, examId })) });
            });
        } else {
            const created = await prisma.exam.create({
                data: {
                    courseId: data.courseId,
                    title: data.title,
                    description: data.description || null,
                    durationMinutes: data.durationMinutes,
                    requiredCorrect: data.requiredCorrect,
                    active: data.active,
                    questions: { create: questionRows },
                },
            });
            savedId = created._id;
        }

        revalidatePath('/account/exams');
        revalidatePath('/account/certificates');
        return { ok: true, examId: savedId };
    } catch (error) {
        console.error('saveExam failed:', error);
        return { ok: false, error: 'ذخیره‌ی آزمون با مشکل مواجه شد.' };
    }
}

export async function toggleExamPublish(examId) {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
        const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { _count: { select: { questions: true } } } });
        if (!exam) return { ok: false, error: 'آزمون پیدا نشد.' };
        if (!exam.active && exam._count.questions === 0) {
            return { ok: false, error: 'آزمونِ بدون سوال را نمی‌توان منتشر کرد.' };
        }
        const updated = await prisma.exam.update({ where: { id: examId }, data: { active: !exam.active } });
        revalidatePath('/account/exams');
        revalidatePath('/account/certificates');
        return { ok: true, active: updated.active };
    } catch (error) {
        console.error('toggleExamPublish failed:', error);
        return { ok: false, error: 'تغییر وضعیت انتشار با مشکل مواجه شد.' };
    }
}

export async function deleteExam(examId) {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
        await prisma.exam.delete({ where: { id: examId } });
        revalidatePath('/account/exams');
        revalidatePath('/account/certificates');
        return { ok: true };
    } catch (error) {
        console.error('deleteExam failed:', error);
        return { ok: false, error: 'حذف آزمون با مشکل مواجه شد.' };
    }
}

/* -------------------------------------------------------------------------
 * Student: start / submit an attempt
 * ---------------------------------------------------------------------- */

/**
 * Starts (or resumes) an attempt. The deadline is decided here, on the
 * server. The correct answers are never sent to the browser.
 */
export async function startExamAttempt(courseId) {
    try {
        const user = await getLoggedInUser();
        if (!user) return { ok: false, error: 'برای شرکت در آزمون ابتدا وارد حساب کاربری خود شوید.' };

        const enrolled = await hasEnrollmentForCourse(courseId, user.id);
        if (!enrolled) return { ok: false, error: 'شما در این دوره ثبت‌نام نکرده‌اید.' };

        const status = await getExamStateForStudent(courseId, user.id);

        if (status.state === 'no_exam') return { ok: false, error: 'برای این دوره آزمونی منتشر نشده است.' };
        if (status.state === 'passed') return { ok: false, error: 'شما قبلاً در این آزمون قبول شده‌اید.' };
        if (status.state === 'locked') {
            return {
                ok: false,
                locked: true,
                lockedUntil: status.lockedUntil,
                error: `شما در آزمون قبول نشدید و تا ${formatFaDate(status.lockedUntil)} امکان شرکت دوباره در آزمون را ندارید.`,
            };
        }

        const examId = status.exam.id;
        let attempt;

        if (status.state === 'in_progress') {
            attempt = await prisma.examAttempt.findUnique({ where: { id: status.attempt.id } });
        } else {
            if (status.exam.questionCount === 0) {
                return { ok: false, error: 'این آزمون هنوز سوالی ندارد.' };
            }
            attempt = await prisma.examAttempt.create({
                data: {
                    examId,
                    studentId: user.id,
                    deadline: new Date(Date.now() + status.exam.durationMinutes * 60 * 1000),
                    totalQuestions: status.exam.questionCount,
                    requiredCorrect: status.exam.requiredCorrect,
                },
            });
        }

        const questions = await getQuestionsForStudent(examId);

        return {
            ok: true,
            attemptId: attempt._id,
            deadline: attempt.deadline.toISOString(),
            serverNow: new Date().toISOString(),
            exam: {
                title: status.exam.title,
                durationMinutes: status.exam.durationMinutes,
                requiredCorrect: status.exam.requiredCorrect,
            },
            questions,
        };
    } catch (error) {
        console.error('startExamAttempt failed:', error);
        return { ok: false, error: 'شروع آزمون با مشکل مواجه شد. دوباره تلاش کنید.' };
    }
}

/**
 * Grades an attempt. `answers` is `{ [questionId]: selectedOptionIndex }`.
 * Submitting after the deadline (plus a small network grace) fails the attempt.
 */
export async function submitExamAttempt(attemptId, answers) {
    try {
        const user = await getLoggedInUser();
        if (!user) return { ok: false, error: 'ابتدا وارد حساب کاربری خود شوید.' };

        const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
        if (!attempt || attempt.studentId !== user.id) return { ok: false, error: 'این آزمون پیدا نشد.' };
        if (attempt.status !== 'in_progress') return { ok: false, error: 'این آزمون قبلاً ثبت شده است.' };

        const now = new Date();
        const timedOut = now.getTime() > attempt.deadline.getTime() + EXAM_SUBMIT_GRACE_SECONDS * 1000;

        const questions = await prisma.examQuestion.findMany({ where: { examId: attempt.examId } });
        const safeAnswers = {};
        for (const q of questions) {
            const picked = answers?.[q._id];
            if (Number.isInteger(picked) && picked >= 0 && picked < EXAM_OPTION_COUNT) safeAnswers[q._id] = picked;
        }

        const correctCount = timedOut ? 0 : questions.filter((q) => safeAnswers[q._id] === q.correctIndex).length;
        const passed = !timedOut && correctCount >= attempt.requiredCorrect;

        // Atomic: only the first submission of an in-progress attempt wins.
        const { count } = await prisma.examAttempt.updateMany({
            where: { id: attemptId, status: 'in_progress' },
            data: {
                status: passed ? 'passed' : 'failed',
                finishedAt: now,
                correctCount,
                totalQuestions: questions.length,
                timedOut,
                answers: safeAnswers,
            },
        });
        if (count === 0) return { ok: false, error: 'این آزمون قبلاً ثبت شده است.' };

        revalidatePath('/account/certificates');

        return {
            ok: true,
            result: {
                passed,
                timedOut,
                correctCount,
                totalQuestions: questions.length,
                requiredCorrect: attempt.requiredCorrect,
                lockedUntil: passed ? null : lockUntilFor(now).toISOString(),
            },
        };
    } catch (error) {
        console.error('submitExamAttempt failed:', error);
        return { ok: false, error: 'ثبت آزمون با مشکل مواجه شد. دوباره تلاش کنید.' };
    }
}
