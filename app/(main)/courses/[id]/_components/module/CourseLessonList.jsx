import React from "react";
import { Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLesson } from "@/queries/lessons";

const CourseLessonList = async ({ lessonId }) => {
  const lesson = await getLesson(lessonId);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary",
      )}
    >
      <Tv size={16} className="flex-none text-primary/70" />
      <span className="truncate">{lesson?.title}</span>
    </button>
  );
};

export default CourseLessonList;
