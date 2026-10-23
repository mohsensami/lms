"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateLesson } from "@/app/actions/lesson";

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const LessonAccessForm = ({ initialData, courseId, lessonId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [free, setFree] = useState(initialData?.isFree);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!free,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      const payload = {};
      if (values.isFree) {
        payload["access"] = "public";
      } else {
        payload["access"] = "private";
      }
      await updateLesson(lessonId, payload);
      setFree(!free);
      toast.success("درس به‌روزرسانی شد");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("مشکلی پیش آمد");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        دسترسی درس
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>انصراف</>
          ) : (
            <>
              <Pencil className="h-4 w-4 ml-2" />
              ویرایش دسترسی
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className={cn("text-sm mt-2", !free && "text-slate-500 italic")}>
          {free ? (
            <>این درس برای پیش‌نمایش رایگان است</>
          ) : (
            <>این درس رایگان نیست</>
          )}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      اگر می‌خواهید این درس برای پیش‌نمایش رایگان باشد، این گزینه را فعال کنید
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                ذخیره
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
