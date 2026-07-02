import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { Course } from '@/model/course-model';
import { Enrollment } from '@/model/enrollment-model';

export async function getEnrollmentsForCourse(courseId) {
    return withDb(async () => {
        const enrollments = await Enrollment.find({ course: courseId }).lean();
        return replaceMongoIdInArray(enrollments);
    });
}

export async function enrollForCourse(courseId, userId, paymentMethod) {
    const newEnrollment = {
        course: courseId,
        student: userId,
        method: paymentMethod,
        enrollment_date: Date.now(),
        status: 'not-started',
    };
    try {
        return await withDb(async () => {
            const response = await Enrollment.create(newEnrollment);
            return response;
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getEnrollmentsForUser(userId) {
    try {
        return await withDb(async () => {
            const enrollments = await Enrollment.find({ student: userId })
                .populate({
                    path: 'course',
                    model: Course,
                })
                .lean();
            return replaceMongoIdInArray(enrollments);
        });
    } catch (err) {
        throw new Error(err);
    }
}

export async function hasEnrollmentForCourse(courseId, studentId) {
    if (!courseId || !studentId) {
        return false;
    }

    try {
        return await withDb(async () => {
            const enrollment = await Enrollment.findOne({
                course: courseId,
                student: studentId,
            })
                .populate({
                    path: 'course',
                    model: Course,
                })
                .lean();

            return Boolean(enrollment);
        });
    } catch (error) {
        throw new Error(error);
    }
}
