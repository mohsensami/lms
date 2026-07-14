import { formatPrice } from '@/lib/formatPrice';
import { notFound } from 'next/navigation';
import CourseDetailsIntro from './_components/CourseDetailsIntro';
import CourseDetails from './_components/CourseDetails';
import Testimonials from './_components/Testimonials';
import RelatedCourses from './_components/RelatedCourses';
import { getCourseDetails, getRelatedCourses, sanitizeCourseForVisitor } from '@/queries/courses';
import { replaceMongoIdInArray } from '@/lib/convertData';
import MoneyBack from '@/components/money-back';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { hasEnrollmentForCourse } from '@/queries/enrollments';

const SingleCoursePage = async ({ params }) => {
    const { id } = await params;
    const course = await getCourseDetails(id);

    if (!course) {
        notFound();
    }

    const currentCourseId = course.id?.toString();
    const categoryId = course?.category?.id || course?.category?._id?.toString() || null;

    if (!currentCourseId) {
        notFound();
    }

    // A visitor who has already purchased this course should be able to
    // watch every lesson from this page too, not just the free-preview
    // ones. Guests / non-enrolled users keep seeing the usual lock icons —
    // and, more importantly, never receive the real video_url for lessons
    // they haven't paid for.
    const loggedInUser = await getLoggedInUser();
    const isEnrolled = loggedInUser ? await hasEnrollmentForCourse(currentCourseId, loggedInUser.id) : false;
    const visibleCourse = sanitizeCourseForVisitor(course, isEnrolled);

    // Fetch related courses only when both course and category IDs exist
    const relatedCourses = currentCourseId && categoryId ? await getRelatedCourses(currentCourseId, categoryId) : [];
    // console.log(relatedCourses);
    return (
        <>
            <CourseDetailsIntro course={visibleCourse} />

            <CourseDetails course={visibleCourse} isEnrolled={isEnrolled} />
            {course?.testimonials && <Testimonials testimonials={replaceMongoIdInArray(course?.testimonials)} />}

            {/* <div className="mb-10">
                <MoneyBack />
            </div> */}

            {/* <div className="mb-12">
                <RelatedCourses relatedCourses={relatedCourses} />
            </div> */}
        </>
    );
};
export default SingleCoursePage;