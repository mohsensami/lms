import 'server-only';
import { prisma } from '@/lib/prisma';
import { EXAM_RETRY_LOCK_DAYS, EXAM_SUBMIT_GRACE_SECONDS } from '@/lib/exam-constants';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * lib/prisma.js renames every `id` to `_id` on query results. For the exam
 * feature we want plain, serialisable objects with `id`, so convert back
 * (recursively) and turn Dates into ISO strings.
 */
function toPlain(value) {
    if (value == null) return value;
    return JSON.parse(JSON.stringify(value));
}

function renameIdBack(value) {
    if (Array.isArray(value)) return value.map(renameIdBack);
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k === '_id' ? 'id' : k] = renameIdBack(v);
        return out;
    }
    return value;
}

/** Prisma result -> plain JSON object (ids as `id`, dates as ISO strings). */
export function plain(value) {
    return renameIdBack(toPlain(value));
}

export function lockUntilFor(finishedAt) {
    return new Date(new Date(finishedAt).getTime() + EXAM_RETRY_LOCK_DAYS * DAY_MS);
}

/**
 * Attempts that were started but never submitted and whose time is over are
 * failed automatically (the student left the page / closed the browser).
 * The 7-day lock counts from the moment the time ran out.
 */
export async function finalizeExpiredAttempts(examId, studentId) {
    const now = new Date();
    const stale = await prisma.examAttempt.findMany({
        where: { examId, studentId, status: 'in_progress', deadline: { lt: new Date(now.getTime() - EXAM_SUBMIT_GRACE_SECONDS * 1000) } },
    });
    for (const attempt of stale) {
        await prisma.examAttempt.update({
            where: { id: attempt._id },
            data: { status: 'failed', finishedAt: attempt.deadline, timedOut: true },
        });
    }
}

/**
 * The single source of truth for "what can this student do with this course's
 * exam right now?".
 *
 * state:
 *  - no_exam      : the course has no published exam
 *  - available    : student may start (a new attempt)
 *  - in_progress  : an attempt is running (resume it)
 *  - locked       : failed recently -> can't retry / request a certificate until `lockedUntil`
 *  - passed       : passed -> may request the certificate
 */
export async function getExamStateForStudent(courseId, studentId) {
    if (!courseId || !studentId) return { state: 'no_exam', exam: null };

    const exam = await prisma.exam.findFirst({
        where: { courseId, active: true },
        include: { _count: { select: { questions: true } } },
    });
    if (!exam) return { state: 'no_exam', exam: null };

    await finalizeExpiredAttempts(exam._id, studentId);

    const examInfo = {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        requiredCorrect: exam.requiredCorrect,
        questionCount: exam._count.questions,
    };

    const passed = await prisma.examAttempt.findFirst({
        where: { examId: exam._id, studentId, status: 'passed' },
        orderBy: { finishedAt: 'desc' },
    });
    if (passed) {
        return {
            state: 'passed',
            exam: examInfo,
            attempt: plain({
                id: passed._id,
                correctCount: passed.correctCount,
                totalQuestions: passed.totalQuestions,
                finishedAt: passed.finishedAt,
            }),
        };
    }

    const running = await prisma.examAttempt.findFirst({
        where: { examId: exam._id, studentId, status: 'in_progress' },
        orderBy: { startedAt: 'desc' },
    });
    if (running) {
        return { state: 'in_progress', exam: examInfo, attempt: plain({ id: running._id, deadline: running.deadline }) };
    }

    const lastFailed = await prisma.examAttempt.findFirst({
        where: { examId: exam._id, studentId, status: 'failed' },
        orderBy: { finishedAt: 'desc' },
    });
    if (lastFailed?.finishedAt) {
        const until = lockUntilFor(lastFailed.finishedAt);
        if (until.getTime() > Date.now()) {
            return {
                state: 'locked',
                exam: examInfo,
                lockedUntil: until.toISOString(),
                attempt: plain({
                    correctCount: lastFailed.correctCount,
                    totalQuestions: lastFailed.totalQuestions,
                    timedOut: lastFailed.timedOut,
                }),
            };
        }
    }

    return { state: 'available', exam: examInfo };
}

/** Has this student passed the exam of this course? (used to gate certificate requests / downloads) */
export async function hasPassedExam(courseId, studentId) {
    const { state } = await getExamStateForStudent(courseId, studentId);
    return state === 'passed';
}

/** Best (latest) passed attempt, used on the certificate PDF. */
export async function getPassedAttempt(courseId, studentId) {
    const exam = await prisma.exam.findFirst({ where: { courseId } });
    if (!exam) return null;
    const attempt = await prisma.examAttempt.findFirst({
        where: { examId: exam._id, studentId, status: 'passed' },
        orderBy: { finishedAt: 'desc' },
    });
    return attempt ? plain(attempt) : null;
}

/** Questions as the student sees them — NEVER includes the correct answer. */
export async function getQuestionsForStudent(examId) {
    const questions = await prisma.examQuestion.findMany({
        where: { examId },
        orderBy: { order: 'asc' },
        select: { id: true, text: true, options: true },
    });
    return plain(questions);
}
