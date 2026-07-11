import { SectionTitle } from '@/components/section-title';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatPrice';
import { getCourseDetailsByInstructor } from '@/queries/courses';
import {
    ArrowLeft,
    ArrowRight,
    ArrowRightIcon,
    BookOpen,
    MessageSquare,
    Presentation,
    Star,
    UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '@/components/user-avatar';
import Link from 'next/link';

const InstructorProfile = async ({ params: { id } }) => {
    const courseDetailsByInstructor = await getCourseDetailsByInstructor(id.toString());
    //console.log(courseDetailsByInstructor);

    return (
        <section id="categories" className="space-y-6  py-6  lg:py-12">
            <div className="container grid grid-cols-12 lg:gap-x-8 gap-y-8">
                {/* Instructor Info */}
                <div className="col-span-12 lg:col-span-4 ">
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <div className="mb-6">
                            <div className="mb-5 mx-auto">
                                <UserAvatar
                                    src={
                                        courseDetailsByInstructor?.insImage === 'Unknown'
                                            ? null
                                            : courseDetailsByInstructor?.insImage
                                    }
                                    alt={courseDetailsByInstructor?.fullInsName}
                                    className="w-36 h-36"
                                    iconClassName="h-14 w-14"
                                />
                            </div>

                            <div>
                                <h4 className="text-xl lg:text-2xl text-center">
                                    {courseDetailsByInstructor?.fullInsName}
                                </h4>
                                <div className="text-gray-600 font-medium mb-6 text-sm text-center">
                                    {courseDetailsByInstructor?.Designation}
                                </div>
                                <ul className=" items-center gap-3 flex-wrap text-sm text-gray-600 font-medium grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 md:grid-cols-4">
                                    <li className="flex items-center space-x-3">
                                        <Presentation className="text-gray-600 w-4" />
                                        <div>{courseDetailsByInstructor?.courses} دوره ها</div>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <UsersRound className="text-gray-600 w-4" />
                                        <div>{courseDetailsByInstructor?.enrollments}+ دانشجو</div>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <MessageSquare className="text-gray-600 w-4" />
                                        <div>{courseDetailsByInstructor?.reviews} دیدگاه ها</div>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <Star className="text-gray-600 w-4" />
                                        <div>{courseDetailsByInstructor?.ratings} میانگین امتیاز</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <p className="text-gray-600 text-xs leading-[1.8] text-justify">
                            سلام! من محسن هستم. من یک توسعه‌دهنده وب هستم که عاشق تدریس هستم. من بنیانگذار این سایت و یک
                            توسعه‌دهنده، برنامه‌نویس و مدرس وب پرشور هستم.
                            <br />
                            من 9 سال است که به صورت آنلاین کار می‌کنم و چندین وب‌سایت موفق ایجاد کرده‌ام که در اینترنت
                            در حال اجرا هستند. من سعی می‌کنم یک دوره مبتنی بر پروژه ایجاد کنم که به شما کمک کند تا به
                            صورت حرفه‌ای یاد بگیرید و به عنوان یک توسعه‌دهنده کامل شناخته شوید.
                        </p>
                    </div>
                </div>
                {/* Courses */}
                <div className="col-span-12 lg:col-span-8">
                    <div>
                        <SectionTitle className="mb-6">دوره ها</SectionTitle>
                        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.isArray(courseDetailsByInstructor?.inscourses) &&
                                courseDetailsByInstructor?.inscourses.map((course) => {
                                    return (
                                        <Link key={course._id} href={`/courses/${course._id}`}>
                                            <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
                                                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                                    <Image
                                                        src={`/assets/images/courses/${course?.thumbnail}`}
                                                        alt={course.title}
                                                        className="object-cover"
                                                        fill
                                                    />
                                                </div>
                                                <div className="flex flex-col pt-2">
                                                    <div className="text-lg md:text-base font-medium group-hover:text-sky-700 line-clamp-2">
                                                        {course?.title}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {course?.category?.title}
                                                    </p>
                                                    <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
                                                        <div className="flex items-center gap-x-1 text-slate-500">
                                                            <div>
                                                                <BookOpen className="w-4" />
                                                            </div>
                                                            <span>{course?.modules?.length} فصل ها</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <p className="text-md md:text-sm font-medium text-slate-700">
                                                            {formatPrice(course?.price)}
                                                        </p>

                                                        <Button
                                                            variant="ghost"
                                                            className="text-xs text-sky-700 h-7 gap-1"
                                                        >
                                                            ثبت نام
                                                            <ArrowLeft className="w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default InstructorProfile;
