import { getPostById } from '@/queries/posts';
import { requireRole } from '@/lib/require-role';
import { notFound } from 'next/navigation';
import { PostEditor } from '../_components/post-editor';
import { getPostCategories } from '@/queries/post-categories';

const EditPost = async ({ params }) => {
    await requireRole('admin');
    const { postId } = await params;
    const [post, categories] = await Promise.all([getPostById(postId), getPostCategories()]);

    if (!post) {
        notFound();
    }

    // Only plain, serialisable data goes to the client editor.
    return <PostEditor post={JSON.parse(JSON.stringify(post))} categories={categories} />;
};

export default EditPost;
