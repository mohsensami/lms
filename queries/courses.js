import { Course } from "@/model/course-model";

export async function getCourses() {
  const courses = await Course.find({});
  return courses;
}
