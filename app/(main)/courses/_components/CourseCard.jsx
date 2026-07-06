import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";
import EnrollCourse from "@/components/enroll-course";

const CourseCard = ({ course }) => {
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
        <span className="text-sm font-bold text-primary">
          {formatPrice(course?.price)}
        </span>
        <EnrollCourse asLink={true} courseId={course?.id} />
      </div>
    </div>
  );
};

export default CourseCard;
