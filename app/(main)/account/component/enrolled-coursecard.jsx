import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import { getCategoryDetails } from '@/queries/categories';
import { getReport } from '@/queries/reports';
import { CourseProgress } from '@/components/course-progress';
import { getCourseDetails } from '@/queries/courses';

const EnrolledCourseCard = async ({ enrollment }) => {
    // console.log(enrollment);
    const courseCategory = await getCategoryDetails(enrollment?.course?.category?._id);

    const filter = {
        course: enrollment?.course?._id,
        student: enrollment?.student?._id,
    };

    const report = await getReport(filter);
    //console.log(report);

    /// Get Total Module Number
    const courseDetails = await getCourseDetails(enrollment?.course?._id);
    const totalModuleCount = courseDetails?.modules?.length;

    /// Total Completed Modules
    const totalCompletedModules = report?.totalCompletedModeules ? report?.totalCompletedModeules?.length : 0;

    /// Total Progress
    const totalProgress = totalModuleCount ? (totalCompletedModules / totalModuleCount) * 100 : 0;

    // Get all Quizzes and Assignments
    const quizzes = report?.quizAssessment?.assessments;
    const totalQuizzes = quizzes?.length ?? 0;

    // Find attempted quizzes
    const quizzesTaken = quizzes ? quizzes.filter((q) => q.attempted) : [];
    //console.log(quizzesTaken);

    // find how many quizzes answered correct
    const totalCorrect = quizzesTaken
        .map((quiz) => {
            const item = quiz.options;
            return item.filter((o) => {
                return o.isCorrect === true && o.isSelected === true;
            });
        })
        .filter((elem) => elem.length > 0)
        .flat();
    //console.log(totalCorrect);

    const marksFromQuizzes = totalCorrect?.length * 5;
    const otherMarks = report?.quizAssessment?.otherMarks ?? 0;
    const totalMarks = marksFromQuizzes + otherMarks;

  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={`/assets/images/courses/${enrollment?.course?.thumbnail}`}
          alt={enrollment?.course?.title}
          className="object-cover"
          fill
        />
      </div>
      <div className="flex flex-col pt-3">
        <div className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary md:text-sm">
          {enrollment?.course?.title}
        </div>
        <span className="text-xs text-muted-foreground">
          {courseCategory?.title}
        </span>
        <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
          <div className="flex items-center gap-x-1.5 text-muted-foreground">
            <BookOpen className="w-4" />
            <span>{enrollment?.course?.modules?.length} فصل</span>
          </div>
        </div>
        <div className="mb-2 border-b border-border pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/80">
              مجموع سرفصل‌ها: {enrollment?.course?.modules?.length}
            </span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
              سرفصل‌های تکمیل‌شده{" "}
              <Badge variant="success">{totalCompletedModules}</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/80">
              مجموع آزمون‌ها: {totalQuizzes}
            </span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
              آزمون‌های داده‌شده <Badge variant="success">{quizzesTaken?.length}</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/80">
              نمره از آزمون‌ها
            </span>
            <span className="text-sm font-medium text-foreground/80">
              {marksFromQuizzes}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/80">
              سایر موارد
            </span>
            <span className="text-sm font-medium text-foreground/80">
              {otherMarks}
            </span>
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            مجموع نمرات
          </span>
          <span className="text-sm font-bold text-primary">
            {totalMarks}
          </span>
        </div>

                <CourseProgress size="sm" value={totalProgress} variant={110 === 100 ? 'success' : ''} />
            </div>
        </div>
    );
};

export default EnrolledCourseCard;
