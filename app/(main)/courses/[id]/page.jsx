import { formatPrice } from '@/lib/formatPrice';
import { notFound } from 'next/navigation';
import CourseDetailsIntro from './_components/CourseDetailsIntro';
import CourseDetails from './_components/CourseDetails';
import Testimonials from './_components/Testimonials';
import CourseCommentForm from './_components/CourseCommentForm';
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

    // Only show comments an admin has approved. Every other visitor's
    // pending/rejected comments stay private to them (visible under their
    // own /account/my-comments page instead).
    const allTestimonials = replaceMongoIdInArray(course?.testimonials || []);
    const approvedTestimonials = allTestimonials.filter((t) => t.status === 'approved');

    // Mark which commenters actually bought this course, so the public
    // list can show a "خریدار این دوره" badge next to their name.
    const testimonialsWithPurchaseInfo = await Promise.all(
        approvedTestimonials.map(async (testimonial) => ({
            ...testimonial,
            isVerifiedBuyer: testimonial?.userId
                ? await hasEnrollmentForCourse(currentCourseId, testimonial.userId)
                : false,
        })),
    );

    return (
        <>
            <CourseDetailsIntro course={visibleCourse} />

            <CourseDetails course={visibleCourse} isEnrolled={isEnrolled} />

            <CourseCommentForm courseId={currentCourseId} loggedInUser={loggedInUser} />
            <Testimonials testimonials={testimonialsWithPurchaseInfo} />

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