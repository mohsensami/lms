"use client";

import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { addQuizToQuizSet } from "@/app/actions/quiz";

const formSchema = z.object({
  title: z
    .string({
      required_error: "سوال الزامی است",
    })
    .min(1, {
      message: "عنوان الزامی است",
    }),
  description: z
    .string({
      required_error: "توضیحات الزامی است",
    })
    .min(1, {
      message: "توضیحات الزامی است",
    }),
  optionA: z.object({
    label: z
      .string({
        required_error: "متن گزینه الزامی است",
      })
      .min(1, {
        message: "متن گزینه الزامی است",
      }),
    isTrue: z.boolean().default(false),
  }),
  optionB: z.object({
    label: z
      .string({
        required_error: "متن گزینه الزامی است",
      })
      .min(1, {
        message: "متن گزینه الزامی است",
      }),
    isTrue: z.boolean().default(false),
  }),
  optionC: z.object({
    label: z
      .string({
        required_error: "متن گزینه الزامی است",
      })
      .min(1, {
        message: "متن گزینه الزامی است",
      }),
    isTrue: z.boolean().default(false),
  }),
  optionD: z.object({
    label: z
      .string({
        required_error: "متن گزینه الزامی است",
      })
      .min(1, {
        message: "متن گزینه الزامی است",
      }),
    isTrue: z.boolean().default(false),
  }),
});

export const AddQuizForm = ({ quizSetId }) => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      title: "",
      description: "",
      optionA: {
        label: "",
        isTrue: false,
      },
      optionB: {
        label: "",
        isTrue: false,
      },
      optionC: {
        label: "",
        isTrue: false,
      },
      optionD: {
        label: "",
        isTrue: false,
      },
    },
  });

  const { isSubmitting, isValid, errors } = form.formState;
  console.log(errors);

  const onSubmit = async (values) => {
    try {
      // console.log({ values });
      const correctness = [
        values.optionA.isTrue,
        values.optionB.isTrue,
        values.optionC.isTrue,
        values.optionD.isTrue,
      ];

      const correctMarked = correctness.filter((c) => c);
      const isOneCorrecrMarked = correctMarked.length === 1;

      if (isOneCorrecrMarked) {
        await addQuizToQuizSet(quizSetId, values);
        form.reset({
          title: "",
          description: "",
          optionA: {
            label: "",
            isTrue: false,
          },
          optionB: {
            label: "",
            isTrue: false,
          },
          optionC: {
            label: "",
            isTrue: false,
          },
          optionD: {
            label: "",
            isTrue: false,
          },
        });
        toast.success("سوال با موفقیت اضافه شد");
        // toggleEdit();
        router.refresh();
      } else {
        toast.error("فقط یک گزینه باید به‌عنوان پاسخ صحیح انتخاب شود");
      }
    } catch (error) {
      toast.error("مشکلی پیش آمد");
    }
  };

  return (
    <div className="mt-6 border bg-gray-50 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        افزودن سوال جدید
      </div>

      {
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* quiz title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>متن سوال</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="متن سوال را وارد کنید"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* quiz description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات سوال</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="توضیحات سوال را وارد کنید"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --------------- OPTION A -------- */}
            <div className="space-y-3">
              <FormLabel>گزینه الف</FormLabel>
              <div className="flex items-start gap-3">
                <FormField
                  control={form.control}
                  name="optionA.isTrue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex-1">
                  {/* option label  */}
                  <FormField
                    control={form.control}
                    name="optionA.label"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="متن سوال را وارد کنید"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* --------------- OPTION A ENDS -------- */}

            {/* --------------- OPTION B -------- */}
            <div className="space-y-3">
              <FormLabel>گزینه ب</FormLabel>
              <div className="flex items-start gap-3">
                <FormField
                  control={form.control}
                  name="optionB.isTrue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex-1">
                  {/* option label  */}
                  <FormField
                    control={form.control}
                    name="optionB.label"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="متن سوال را وارد کنید"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* --------------- OPTION B ENDS -------- */}

            {/* --------------- OPTION C -------- */}
            <div className="space-y-3">
              <FormLabel>گزینه ج</FormLabel>
              <div className="flex items-start gap-3">
                <FormField
                  control={form.control}
                  name="optionC.isTrue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex-1">
                  {/* option label  */}
                  <FormField
                    control={form.control}
                    name="optionC.label"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="متن سوال را وارد کنید"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* --------------- OPTION C ENDS -------- */}

            {/* --------------- OPTION D -------- */}
            <div className="space-y-3">
              <FormLabel>گزینه د</FormLabel>
              <div className="flex items-start gap-3">
                <FormField
                  control={form.control}
                  name="optionD.isTrue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex-1">
                  {/* option label  */}
                  <FormField
                    control={form.control}
                    name="optionD.label"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="متن سوال را وارد کنید"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* --------------- OPTION D ENDS -------- */}
            <div className="flex items-center justify-end gap-x-2">
              <Button disabled={isSubmitting} type="submit">
                ذخیره
              </Button>
            </div>
          </form>
        </Form>
      }
    </div>
  );
};
