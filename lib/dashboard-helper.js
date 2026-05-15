import { auth } from "@/auth";
import { getCourseDetailsByInstructor } from "@/queries/courses";
import { getUserByEmail, getUserDetails } from "@/queries/users";

export const COURSE_DATA = "course";
export const ENROLLMENT_DATA = "enrollment";
export const REVIEW_DATA = "review";

const populateReviewData = async (reviews) => {
  const populatedReviews = await Promise.all(
    reviews.map(async (review) => {
      const student = await getUserDetails(review?.user?._id);
      review["studentName"] = `${student?.firstName} ${student?.lastName}`;
      return review;
    }),
  );
  return populatedReviews;
};

export async function getInstructorDashboardData(dataType) {
  try {
    const session = await auth();
    const instructor = await getUserByEmail(session?.user?.email);
    //console.log(instructor);
    const data = await getCourseDetailsByInstructor(instructor?.id, true);

    switch (dataType) {
      case COURSE_DATA:
        return data?.courses;

      case REVIEW_DATA:
        return populateReviewData(data?.reviews);

      case ENROLLMENT_DATA:
        return populateEnrollmentData(data?.enrollments);

      default:
        return data;
    }
  } catch (error) {
    throw new Error(error);
  }
}

const populateEnrollmentData = async (enrollments) => {
  //console.log(enrollments);

  const populatedEnrollments = await Promise.all(
    enrollments.map(async (enrollment) => {
      // Update student information
      const student = await getUserDetails(enrollment?.student?._id);
      // console.log(student);
      enrollment["studentName"] = `${student?.firstName} ${student?.lastName}`;
      enrollment["studentEmail"] = student?.email;

      // Update quiz and Progress info
    }),
  );
};
