"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// react-player uses browser APIs, so it must be loaded on the client only.
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const CourseLessonPreview = ({ lesson }) => {
  const [open, setOpen] = useState(false);
  const isFree = lesson?.access === "public";

  if (!isFree) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-70",
        )}
      >
        <Lock size={16} className="flex-none text-muted-foreground" />
        <span className="truncate">{lesson?.title}</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
      >
        <span className="flex items-center gap-2.5 truncate">
          <PlayCircle size={16} className="flex-none text-primary" />
          <span className="truncate">{lesson?.title}</span>
        </span>
        <Badge
          variant="outline"
          className="flex-none border-primary/30 text-[10px] text-primary"
        >
          پیش‌نمایش رایگان
        </Badge>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-right">{lesson?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-slate-950">
            {open && (
              <ReactPlayer
                url={lesson?.video_url}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                    },
                  },
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseLessonPreview;