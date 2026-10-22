import { requireRole } from '@/lib/require-role';
import AddPostForm from '../_components/add-post-form';

const AddPost = async () => {
    const user = await requireRole('instructor');
    return <AddPostForm isAdmin={user.role === 'admin'} />;
};

export default AddPost;
