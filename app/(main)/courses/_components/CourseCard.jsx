import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, PlayCircle, CheckCircle2 } from "lucide-react";
import { PriceDisplay } from "@/components/price-display";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EnrollCourse from "@/components/enroll-course";

const CourseCard = ({ course, isLoggedIn = true, isEnrolled = false, isFullAccess = false }) => {
  const hasAccess = isEnrolled || isFullAccess;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <Link href={`/courses/${course.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={`/assets/images/courses/${course?.thumbnail}`}
            alt={course?.title || "course"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
          />
          {course?.category?.title && (
            <Badge className="absolute right-3 top-3 border-none bg-background/90 text-foreground shadow backdrop-blur">
              {course.category.title}
            </Badge>
          )}
          {hasAccess && (
            <Badge variant="success" className="absolute left-3 top-3 flex items-center gap-1 border-none shadow">
              <CheckCircle2 className="h-3 w-3" />
              خریداری‌شده
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-base font-bold leading-7 text-foreground transition-colors group-hover:text-primary">
            {course?.title}
          </h3>

          <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course?.modules?.length ?? 0} فصل</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <PriceDisplay course={course} priceClassName="text-sm" showCountdown={false} />
        {hasAccess ? (
          <Link
            href={`/courses/${course?.id}/lesson`}
            className={cn(
              buttonVariants({ size: 'sm', variant: 'secondary' }),
              'h-8 gap-1 rounded-full text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground',
            )}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            ورود به دوره
          </Link>
        ) : (
          <EnrollCourse asLink={true} courseId={course?.id} isLoggedIn={isLoggedIn} />
        )}
      </div>
    </div>
  );
};

export default CourseCard;
