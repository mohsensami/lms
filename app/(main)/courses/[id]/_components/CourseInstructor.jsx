import React from 'react';
import { Presentation, UsersRound, Star, MessageSquare, ArrowLeft } from 'lucide-react';
import { getCourseDetailsByInstructor } from '@/queries/courses';
import UserAvatar from '@/components/user-avatar';
import Link from 'next/link';

const CourseInstructor = async ({ course }) => {
    const instructor = course?.instructor;
    const fullName = `${instructor?.firstName} ${instructor?.lastName}`;

    const courseDetailsByInstructor = await getCourseDetailsByInstructor(instructor._id.toString());

    const stats = [
        { icon: Presentation, label: 'دوره', value: courseDetailsByInstructor?.courses },
        { icon: UsersRound, label: 'دانشجو', value: `${courseDetailsByInstructor?.enrollments}+` },
        { icon: MessageSquare, label: 'نظر', value: courseDetailsByInstructor?.reviews },
        { icon: Star, label: 'امتیاز', value: courseDetailsByInstructor?.ratings },
    ];

    return (
        <div className="rounded-2xl bg-muted/60 p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row">
                <div className="mx-auto flex-none sm:mx-0">
                    <UserAvatar
                        src={instructor?.profilePicture}
                        alt={fullName}
                        className="h-40 w-40 rounded-2xl"
                        iconClassName="h-16 w-16"
                    />
                </div>
                <div className="flex-1 text-center sm:text-right">
                    <h4 className="text-xl font-extrabold text-foreground">{fullName}</h4>
                    <p className="mb-4 mt-1 text-sm font-medium text-muted-foreground">{instructor?.designation}</p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {stats.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="rounded-xl bg-card p-3">
                                <Icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
                                <p className="text-sm font-bold text-foreground">{value}</p>
                                <p className="text-[11px] text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>

                    <Link
                        href={`/inst-profile/${instructor?._id}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                    >
                        مشاهده پروفایل
                        <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
            <p className="mt-6 leading-8 text-muted-foreground">{instructor?.bio}</p>
        </div>
    );
};

export default CourseInstructor;
