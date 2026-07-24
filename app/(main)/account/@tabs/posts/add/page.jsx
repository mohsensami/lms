import { requireRole } from '@/lib/require-role';
import AddPostForm from '../_components/add-post-form';

const AddPost = async () => {
    await requireRole('admin');
    return <AddPostForm />;
};

export default AddPost;
