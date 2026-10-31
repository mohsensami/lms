import { getLoggedInUser } from '@/lib/loggedin-user';
import { redirect } from 'next/navigation';
import { hasFullCourseAccess } from '@/queries/enrollments';

const CourseLayout = async ({ children, params }) => {
    const { id } = await params;
    const loggedinUser = await getLoggedInUser();
    if (!loggedinUser) {
        redirect('/login');
    }

    // Buyers and admins may open the lesson area.
    const canAccess = await hasFullCourseAccess(loggedinUser, id);
    if (!canAccess) {
        redirect('/courses');
    }

    return <div className="pt-6 lg:pt-10">{children}</div>;
};
export default CourseLayout;
