import { CourseProgress } from '@/components/course-progress';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import { Lock } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { CourseSidebarMobile } from './_components/course-sidebar-mobile';
import { CourseSidebar } from './_components/course-sidebar';
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

    return (
        <div className="">
            <div className="h-[80px]  top-[60px] inset-x-0 w-full z-10">
                <div className="flex lg:hidden p-4 border-b h-full items-center bg-white shadow-sm relative">
                    {/* Course Sidebar For Mobile */}
                    <CourseSidebarMobile courseId={id} />
                    {/* <NavbarRoutes /> */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
                <main className="lg:col-span-8 pt-[80px] lg:pt-[20px] h-full px-4 lg:px-6">{children}</main>
                <aside className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto px-4 pb-20 lg:px-0">
                        <CourseSidebar courseId={id} />
                    </div>
                </aside>
            </div>
        </div>
    );
};
export default CourseLayout;
