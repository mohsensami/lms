import SearchCourse from "./_components/SearchCourse";
import SortCourse from "./_components/SortCourse";
import FilterCourseMobile from "./_components/FilterCourseMobile";
import ActiveFilters from "./_components/ActiveFilters";
import FilterCourse from "./_components/FilterCourse";
import { getCourseList } from "@/queries/courses";
import CourseCard from "./_components/CourseCard";

const CoursesPage = async () => {
  const courses = await getCourseList();

  return (
    <section id="courses" className="container space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">دوره‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">{courses.length} دوره در دسترس</p>
      </div>

      {/* header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <SearchCourse />

        <div className="flex items-center justify-end gap-2 max-lg:w-full">
          <SortCourse />
          <FilterCourseMobile />
        </div>
      </div>
      {/* header ends */}

      <ActiveFilters
        filter={{
          categories: ["development"],
          price: ["free"],
          sort: "",
        }}
      />

      <section className="pb-24 pt-2">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          <FilterCourse />
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
            {courses.map((course) => {
              return <CourseCard key={course.id} course={course} />;
            })}
          </div>
        </div>
      </section>
    </section>
  );
};
export default CoursesPage;
