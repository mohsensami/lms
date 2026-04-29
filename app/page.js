import { getCourses } from "@/queries/courses";

export default async function Home() {
  const courses = await getCourses();
  console.log(courses);
  return <div>Home</div>;
}
