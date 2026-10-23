"use client";

import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourse } from "@/app/actions/course";
import { toast } from "sonner";

const formSchema = z.object({
  subtitle: z.string().min(1, {
    message: "عنوان الزامی است",
  }),
});

export const SubTitleForm = ({ initialData = {}, courseId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await updateCourse(courseId, values);
      toggleEdit();
      router.refresh();
      toast.success("زیرعنوان دوره به‌روزرسانی شد");
    } catch (error) {
      toast.error("مشکلی پیش آمد");
    }
  };

  return (
    <div className="mt-6 border bg-gray-50 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        زیرعنوان دوره
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>انصراف</>
          ) : (
            <>
              <Pencil className="h-4 w-4 ml-2" />
              ویرایش زیرعنوان
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="text-sm mt-2">{initialData.subtitle}</p>}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="مثلاً: «آموزش پیشرفته متلب»"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
