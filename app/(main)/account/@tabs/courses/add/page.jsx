import { requireRole } from '@/lib/require-role';
import AddCourseForm from '../_components/add-course-form';

const AddCourse = async () => {
    await requireRole('admin');
    return <AddCourseForm />;
};

export default AddCourse;
