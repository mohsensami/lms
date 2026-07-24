import {
  getInstructorDashboardData,
  COURSE_DATA,
} from "@/lib/dashboard-helper";
import { requireRole } from "@/lib/require-role";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export const dynamic = "force-dynamic";

const CoursesPage = async () => {
  await requireRole("instructor");
  const courses = sanitizeData(await getInstructorDashboardData(COURSE_DATA));
  // console.log(courses);

  return (
    <div className="p-6">
      {/* <Link href="/teacher/create">
        <Button>New Course</Button>
      </Link> */}
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

function sanitizeData(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (Buffer.isBuffer(value)) {
        return value.toString("base64");
      }
      return value;
    }),
  );
}

export default CoursesPage;
