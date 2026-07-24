import { requireRole } from '@/lib/require-role';
import AddCourseForm from '../_components/add-course-form';

const AddCourse = async () => {
    await requireRole('instructor');
    return <AddCourseForm />;
};

export default AddCourse;
