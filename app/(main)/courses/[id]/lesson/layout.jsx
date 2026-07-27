import { getLoggedInUser } from '@/lib/loggedin-user';
import { redirect } from 'next/navigation';
import { hasEnrollmentForCourse } from '@/queries/enrollments';

const CourseLayout = async ({ children, params: { id } }) => {
    const loggedinUser = await getLoggedInUser();
    if (!loggedinUser) {
        redirect('/login');
    }

    const isEnrolled = await hasEnrollmentForCourse(id, loggedinUser.id);
    if (!isEnrolled) {
        redirect('/courses');
    }

    return <div className="pt-6 lg:pt-10">{children}</div>;
};
export default CourseLayout;
