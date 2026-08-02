import { getCourseList } from '@/queries/courses';
import CourseCard from './_components/CourseCard';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { hasEnrollmentForCourse } from '@/queries/enrollments';

export const metadata = {
    title: 'دوره‌ها',
    description: 'لیست کامل دوره‌های آموزشی موجود.',
};

const CoursesPage = async () => {
    const courses = await getCourseList();
    const loggedInUser = await getLoggedInUser();
    const isLoggedIn = Boolean(loggedInUser);

    const accessByCourseId = {};
    if (loggedInUser) {
        await Promise.all(
            courses.map(async (course) => {
                const isFullAccess =
                    loggedInUser.role === 'admin' ||
                    (loggedInUser.role === 'instructor' && course.instructorId === loggedInUser.id);
                const isEnrolled = isFullAccess ? false : await hasEnrollmentForCourse(course.id, loggedInUser.id);
                accessByCourseId[course.id] = { isFullAccess, isEnrolled };
            }),
        );
    }

    return (
        <section id="courses" className="container space-y-8 py-10 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                    دوره‌ها
                </span>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                    دوره‌های آموزشی
                </h1>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {courses.length} دوره برای یادگیری در دسترس شماست.
                </p>
            </div>

            {courses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isLoggedIn={isLoggedIn}
                            isEnrolled={accessByCourseId[course.id]?.isEnrolled}
                            isFullAccess={accessByCourseId[course.id]?.isFullAccess}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">هنوز هیچ دوره‌ای منتشر نشده است.</p>
            )}
        </section>
    );
};
export default CoursesPage;
