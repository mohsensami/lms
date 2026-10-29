import { requireRole } from '@/lib/require-role';
import { PostEditor } from '../_components/post-editor';
import { getPostCategories } from '@/queries/post-categories';

const AddPost = async () => {
    await requireRole('admin');
    const categories = await getPostCategories();
    return <PostEditor categories={categories} />;
};

export default AddPost;
