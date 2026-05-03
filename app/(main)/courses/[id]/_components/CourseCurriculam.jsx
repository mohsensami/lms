import React from "react";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { Presentation } from "lucide-react";
import { UsersRound } from "lucide-react";
import { Star } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { BookCheck } from "lucide-react";
import { Clock10 } from "lucide-react";
import { Radio } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Video } from "lucide-react";
import { NotepadText } from "lucide-react";
import { FileQuestion } from "lucide-react";
import { PlayCircle } from "lucide-react";
import { SquarePlay } from "lucide-react";
import { Tv } from "lucide-react";
import { StickyNote } from "lucide-react";
import { BookOpen } from "lucide-react";
import { ArrowRight } from "lucide-react";

const CourseCurriculam = () => {
  return (
    <>
      <div className="flex gap-x-5 items-center justify-center flex-wrap mt-4 mb-6 text-gray-600 text-sm">
        <span className="flex items-center gap-1.5">
          <BookCheck className="w-4 h-4" />
          12 Chapters
        </span>
        <span className="flex items-center gap-1.5">
          <Clock10 className="w-4 h-4" />
          50+ Hours
        </span>
        <span className="flex items-center gap-1.5">
          <Radio className="w-4 h-4" />4 Live Class
        </span>
      </div>

      <Accordion
        defaultValue={["item-1", "item-2", "item-3"]}
        type="multiple"
        collapsible="true"
        className="w-full"
      >
        <AccordionItem className="border-none" value="item-1">
          <AccordionTrigger>Introduction</AccordionTrigger>
          <AccordionContent>
            {/* header */}
            <div className="flex gap-x-5 items-center flex-wrap mt-4 mb-6 text-gray-600 text-sm">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                12 Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <NotepadText className="w-4 h-4" />
                10 Notes
              </span>
              <span className="flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4" />
                10 Quiz
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4" />1 Live Class
              </span>
            </div>
            {/* header ends */}

            <div className="space-y-3">
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  What is React ?
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  Learn React Basics
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  Build A Simple React App
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <StickyNote size={16} className={cn("text-slate-500")} />
                  React Basic Note
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <StickyNote size={16} className={cn("text-slate-500")} />
                  Project Requirement Analysis
                </div>
              </button>
              {/* item ends */}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem className="border-none" value="item-2">
          <AccordionTrigger>Master Next JS</AccordionTrigger>
          <AccordionContent>
            {/* header */}
            <div className="flex gap-x-5 items-center flex-wrap mt-4 mb-6 text-gray-600 text-sm">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                12 Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <NotepadText className="w-4 h-4" />
                10 Notes
              </span>
              <span className="flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4" />
                10 Quiz
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4" />1 Live Class
              </span>
            </div>
            {/* header ends */}

            <div className="space-y-3">
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  What is React ?
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  Learn React Basics
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  Build A Simple React App
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <StickyNote size={16} className={cn("text-slate-500")} />
                  React Basic Note
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <StickyNote size={16} className={cn("text-slate-500")} />
                  Project Requirement Analysis
                </div>
              </button>
              {/* item ends */}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem className="border-none" value="item-3">
          <AccordionTrigger>Built Ecommerce Using Next.js</AccordionTrigger>
          <AccordionContent>
            {/* header */}
            <div className="flex gap-x-5 items-center flex-wrap mt-4 mb-6 text-gray-600 text-sm">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                12 Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <NotepadText className="w-4 h-4" />
                10 Notes
              </span>
              <span className="flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4" />
                10 Quiz
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4" />1 Live Class
              </span>
            </div>
            {/* header ends */}

            <div className="space-y-3">
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  What is React ?
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  Learn React Basics
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <Tv size={16} className={cn("text-slate-500")} />
                  Build A Simple React App
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <StickyNote size={16} className={cn("text-slate-500")} />
                  React Basic Note
                </div>
              </button>
              {/* item ends */}
              {/* item */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-[500]  transition-all hover:text-slate-600  w-full",
                )}
              >
                <div className="flex items-center gap-x-2">
                  <StickyNote size={16} className={cn("text-slate-500")} />
                  Project Requirement Analysis
                </div>
              </button>
              {/* item ends */}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default CourseCurriculam;
