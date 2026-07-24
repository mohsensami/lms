import { replaceMongoIdInArray, replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { getEnrollmentsForCourse } from './enrollments';
import { getTestimonialsForCourse } from './testimonials';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Public, read-heavy course data is cached with Next.js's Data Cache so
// revisiting a page (course list, course details, ...) doesn't hit
// Postgres again until something actually changes. Every mutating action
// (create/update/delete course, module, lesson, quiz, review, ...) calls
// `revalidateTag('courses')` so the cache is invalidated immediately when
// content is edited — the 5 minute `revalidate` below is just a safety net.
export const COURSES_CACHE_TAG = 'courses';

const getCachedCourseList = unstable_cache(
    async () => {
        return withDb(async () => {
            const courses = await prisma.course.findMany({
                where: { active: true },
                include: {
                    category: true,
                    instructor: true,
                    testimonials: true,
                    modules: true,
                },
            });
            return replaceMongoIdInArray(courses);
        });
    },
    ['course-list'],
    { tags: [COURSES_CACHE_TAG], revalidate: 300 },
);

export async function getCourseList() {
    return getCachedCourseList();
}

const getCachedCourseDetails = unstable_cache(
    async (courseId) => {
        return withDb(async () => {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    category: true,
                    instructor: true,
                    testimonials: {
                        include: { user: true },
                    },
                    modules: {
                        orderBy: { order: 'asc' },
                        include: {
                            lessonIds: { orderBy: { order: 'asc' } },
                        },
                    },
                    quizSet: {
                        include: { quizIds: true },
                    },
                },
            });
            return replaceMongoIdInObject(course);
        });
    },
    ['course-details'],
    { tags: [COURSES_CACHE_TAG], revalidate: 300 },
);

export async function getCourseDetails(id) {
    const courseId = toIdString(id);
    if (!courseId) return null;
    return getCachedCourseDetails(courseId);
}

// getCourseDetails() is shared (cached, no user context) and used by admin/
// instructor dashboard pages and the enrolled-student lesson page too, both
// of which legitimately need every lesson's video_url. The public course
// landing page is the only place that must NOT leak locked lessons' URLs to
// visitors who haven't paid for them, so we sanitize a copy of the course
// there instead of touching the shared query.
//
// `isEnrolled` — whether the current visitor purchased this course — is
// resolved server-side per-request (see app/(main)/courses/[id]/page.jsx),
// so a lesson's real video_url only ever leaves the server when it's
// actually public or the visitor is entitled to it.
export function sanitizeCourseForVisitor(course, isEnrolled) {
    if (!course) return course;

    return {
        ...course,
        modules: (course.modules || []).map((module) => ({
            ...module,
            lessonIds: (module.lessonIds || []).map((lesson) => {
                const isPlayable = lesson?.access === 'public' || isEnrolled;
                return isPlayable ? lesson : { ...lesson, video_url: null };
            }),
        })),
    };
}

function groupBy(array, keyFn) {
    return array.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
}

export async function getCourseDetailsByInstructor(instructorId, expand) {
    return withDb(async () => {
        const publishCourses = await prisma.course.findMany({
            where: {
                instructorId,
                active: true,
            },
            include: {
                category: true,
                testimonials: true,
                instructor: true,
            },
        });

        const enrollments = await Promise.all(
            publishCourses.map(async (course) => {
                const enrollment = await getEnrollmentsForCourse(course._id);
                return enrollment;
            }),
        );

        // Group enrollments by course
        const groupByCourses = groupBy(enrollments.flat(), (item) => item.course);

        /// Calculate total revenue
        const totalRevenue = publishCourses.reduce((acc, course) => {
            const enrollmentsForCourse = groupByCourses[course._id] || [];
            return acc + enrollmentsForCourse.length * course.price;
        }, 0);

        const totalEnrollments = enrollments.reduce((acc, obj) => {
            return acc + obj.length;
        }, 0);

        const tesimonials = await Promise.all(
            publishCourses.map(async (course) => {
                const tesimonial = await getTestimonialsForCourse(course._id);
                return tesimonial;
            }),
        );

        const totalTestimonials = tesimonials.flat();
        const avgRating =
            totalTestimonials.reduce(function (acc, obj) {
                return acc + obj.rating;
            }, 0) / totalTestimonials.length;

        const firstName = publishCourses.length > 0 ? publishCourses[0]?.instructor?.firstName : 'Unknown';
        const lastName = publishCourses.length > 0 ? publishCourses[0]?.instructor?.lastName : 'Unknown';
        const fullInsName = `${firstName} ${lastName}`;

        const Designation = publishCourses.length > 0 ? publishCourses[0]?.instructor?.designation : 'Unknown';

        const insImage = publishCourses.length > 0 ? publishCourses[0]?.instructor?.profilePicture : 'Unknown';

        if (expand) {
            const allCourses = await prisma.course.findMany({ where: { instructorId } });
            return {
                courses: allCourses,
                enrollments: enrollments?.flat(),
                reviews: totalTestimonials,
            };
        }

        return {
            courses: publishCourses.length,
            enrollments: totalEnrollments,
            reviews: totalTestimonials.length,
            ratings: avgRating.toPrecision(2),
            inscourses: publishCourses,
            revenue: totalRevenue,
            fullInsName,
            Designation,
            insImage,
        };
    });
}

export async function getAllCoursesDashboardData(expand) {
    return withDb(async () => {
        const publishCourses = await prisma.course.findMany({
            where: {
                active: true,
            },
            include: {
                category: true,
                testimonials: true,
                instructor: true,
            },
        });

        const enrollments = await Promise.all(
            publishCourses.map(async (course) => {
                const enrollment = await getEnrollmentsForCourse(course._id);
                return enrollment;
            }),
        );

        const groupByCourses = groupBy(enrollments.flat(), (item) => item.course);

        const totalRevenue = publishCourses.reduce((acc, course) => {
            const enrollmentsForCourse = groupByCourses[course._id] || [];
            return acc + enrollmentsForCourse.length * course.price;
        }, 0);

        const totalEnrollments = enrollments.reduce((acc, obj) => {
            return acc + obj.length;
        }, 0);

        const tesimonials = await Promise.all(
            publishCourses.map(async (course) => {
                const tesimonial = await getTestimonialsForCourse(course._id);
                return tesimonial;
            }),
        );

        const totalTestimonials = tesimonials.flat();
        const avgRating =
            totalTestimonials.reduce(function (acc, obj) {
                return acc + obj.rating;
            }, 0) / totalTestimonials.length;

        if (expand) {
            const allCourses = await prisma.course.findMany({});
            return {
                courses: allCourses,
                enrollments: enrollments?.flat(),
                reviews: totalTestimonials,
            };
        }

        return {
            courses: publishCourses.length,
            enrollments: totalEnrollments,
            reviews: totalTestimonials.length,
            ratings: avgRating.toPrecision(2),
            inscourses: publishCourses,
            revenue: totalRevenue,
        };
    });
}

export async function create(courseData) {
    try {
        return await withDb(async () => {
            const course = await prisma.course.create({ data: courseData });
            return JSON.parse(JSON.stringify(course));
        });
    } catch (error) {
        throw new Error(error);
    }
}

const getCachedCoursesByCategory = unstable_cache(
    async (categoryId) => {
        return withDb(async () => {
            const courses = await prisma.course.findMany({
                where: { categoryId },
                include: { category: true },
            });
            return courses;
        });
    },
    ['courses-by-category'],
    { tags: [COURSES_CACHE_TAG], revalidate: 300 },
);

export async function getCoursesByCategory(categoryId) {
    try {
        return await getCachedCoursesByCategory(categoryId);
    } catch (error) {
        throw new Error(error);
    }
}

const getCachedCategoryById = unstable_cache(
    async (id) => {
        return withDb(async () => {
            const category = await prisma.category.findUnique({ where: { id } });
            return category;
        });
    },
    ['category-by-id'],
    { tags: [COURSES_CACHE_TAG], revalidate: 300 },
);

export const getCategoryById = async (categoryId) => {
    try {
        const id = toIdString(categoryId);
        if (!id) return null;
        return await getCachedCategoryById(id);
    } catch (error) {
        throw new Error(error);
    }
};

const getCachedRelatedCourses = unstable_cache(
    async (currentCourseId, categoryId) => {
        return withDb(async () => {
            const relatedCourses = await prisma.course.findMany({
                where: {
                    categoryId,
                    id: { not: currentCourseId },
                    active: true,
                },
                select: {
                    id: true,
                    title: true,
                    thumbnail: true,
                    price: true,
                },
            });
            return relatedCourses;
        });
    },
    ['related-courses'],
    { tags: [COURSES_CACHE_TAG], revalidate: 300 },
);

export async function getRelatedCourses(currentCourseId, categoryId) {
    try {
        return await getCachedRelatedCourses(currentCourseId, categoryId);
    } catch (error) {
        throw new Error(error);
    }
}