import { requireRole } from '@/lib/require-role';
import AddPostForm from '../_components/add-post-form';
import { getPostCategories } from '@/queries/post-categories';

const AddPost = async () => {
    await requireRole('admin');
    const categories = await getPostCategories();
    return <AddPostForm categories={categories} />;
};

export default AddPost;
