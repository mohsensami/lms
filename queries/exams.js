import { prisma } from '@/lib/prisma';
import { plain } from '@/lib/exam';

/** All exams (admin list), newest first, with their course and counts. */
export async function getAllExams() {
    const exams = await prisma.exam.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            course: { select: { id: true, title: true } },
            _count: { select: { questions: true, attempts: true } },
        },
    });
    return plain(exams);
}

export async function getExamForEdit(examId) {
    if (!examId) return null;
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { questions: { orderBy: { order: 'asc' } } },
    });
    return exam ? plain(exam) : null;
}

/**
 * Courses an exam can be created for: every course that doesn't have an
 * exam yet (plus `includeCourseId`, the course of the exam being edited).
 */
export async function getCoursesForExamSelect(includeCourseId) {
    const courses = await prisma.course.findMany({
        where: {
            OR: [{ exam: null }, ...(includeCourseId ? [{ id: includeCourseId }] : [])],
        },
        orderBy: { createdOn: 'desc' },
        select: { id: true, title: true },
    });
    return plain(courses).map((c) => ({ value: c.id, label: c.title }));
}
