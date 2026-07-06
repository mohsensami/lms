import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { getCourseDetailsByInstructor } from "@/queries/courses";
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Presentation,
  Star,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const InstructorProfile = async ({ params: { id } }) => {
  const courseDetailsByInstructor = await getCourseDetailsByInstructor(
    id.toString(),
  );

  const stats = [
    { icon: Presentation, label: "دوره", value: courseDetailsByInstructor?.courses },
    { icon: UsersRound, label: "دانشجو", value: `${courseDetailsByInstructor?.enrollments}+` },
    { icon: MessageSquare, label: "نظر", value: courseDetailsByInstructor?.reviews },
    { icon: Star, label: "امتیاز", value: courseDetailsByInstructor?.ratings },
  ];

  return (
    <section id="categories" className="space-y-6 py-8 lg:py-14">
      <div className="container grid grid-cols-12 gap-y-8 lg:gap-x-8">
        {/* Instructor Info */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <div className="mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full">
                <Image
                  src={courseDetailsByInstructor?.insImage}
                  alt={courseDetailsByInstructor?.fullInsName}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover rounded"
                />
              </div>

              <div>
                <h4 className="text-center text-xl font-extrabold text-foreground lg:text-2xl">
                  {courseDetailsByInstructor?.fullInsName}
                </h4>
                <div className="mb-6 text-center text-sm font-medium text-muted-foreground">
                  {courseDetailsByInstructor?.Designation}
                </div>
                <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-muted-foreground">
                  {stats.map(({ icon: Icon, label, value }) => (
                    <li key={label} className="flex items-center gap-2 rounded-xl bg-muted/60 p-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <div>
                        {value} {label}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-justify text-xs leading-[1.8] text-muted-foreground">
              {courseDetailsByInstructor?.bio ||
                "این مدرس هنوز بیوگرافی‌ای ثبت نکرده است."}
            </p>
          </div>
        </div>
        {/* Courses */}
        <div className="col-span-12 lg:col-span-8">
          <div>
            <SectionTitle className="mb-6">دوره‌های مدرس</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.isArray(courseDetailsByInstructor?.inscourses) &&
                courseDetailsByInstructor?.inscourses.map((course) => {
                  return (
                    <Link key={course._id} href={`/courses/${course._id}`}>
                      <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={`/assets/images/courses/${course?.thumbnail}`}
                            alt={course.title}
                            className="object-cover"
                            fill
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 pt-3">
                          <div className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary">
                            {course?.title}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {course?.category?.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{course?.modules?.length} فصل</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm font-bold text-primary">
                              {formatPrice(course?.price)}
                            </p>

                            <Button
                              variant="ghost"
                              className="h-7 gap-1 text-xs font-semibold text-primary"
                            >
                              ثبت‌نام
                              <ArrowLeft className="h-3 w-3" />
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
