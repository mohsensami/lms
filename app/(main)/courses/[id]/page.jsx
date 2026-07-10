import { formatPrice } from '@/lib/formatPrice';
import { notFound } from 'next/navigation';
import CourseDetailsIntro from './_components/CourseDetailsIntro';
import CourseDetails from './_components/CourseDetails';
import Testimonials from './_components/Testimonials';
import RelatedCourses from './_components/RelatedCourses';
import { getCourseDetails, getRelatedCourses } from '@/queries/courses';
import { replaceMongoIdInArray } from '@/lib/convertData';
import MoneyBack from '@/components/money-back';

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

    // Fetch related courses only when both course and category IDs exist
    const relatedCourses = currentCourseId && categoryId ? await getRelatedCourses(currentCourseId, categoryId) : [];
    // console.log(relatedCourses);
    return (
        <>
            <CourseDetailsIntro course={course} />

            <CourseDetails course={course} />
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
