import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/queries/users';
import { getEnrollmentsForUser } from '@/queries/enrollments';
import CourseCertificateCard from '../../component/course-certificate-card';

async function Certificates() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const loggedInUser = await getUserByEmail(session?.user?.email);
    const enrollments = await getEnrollmentsForUser(loggedInUser?.id);

    return (
        <div className="flex flex-col gap-4">
            {enrollments && enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                    <CourseCertificateCard key={enrollment.id} enrollment={enrollment} userId={loggedInUser.id} />
                ))
            ) : (
                <div className="font-bold bg-red-400 text-white p-2 w-100">هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید!</div>
            )}
        </div>
    );
}

export default Certificates;
