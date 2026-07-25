import { getPostById } from '@/queries/posts';
import { requireRole } from '@/lib/require-role';
import { notFound } from 'next/navigation';
import { PostTitleForm } from '../_components/post-title-form';
import { PostSlugForm } from '../_components/post-slug-form';
import { PostContentForm } from '../_components/post-content-form';
import { PostThumbnailForm } from '../_components/post-thumbnail-form';
import { PostActions } from '../_components/post-actions';
import { PostSeoForm } from '../_components/post-seo-form';

const EditPost = async ({ params: { postId } }) => {
    await requireRole('admin');
    const post = await getPostById(postId);

    if (!post) {
        notFound();
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">ویرایش پست</h1>
                <PostActions postId={post.id} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <PostTitleForm initialData={post} postId={post.id} />
                    <PostSlugForm initialData={post} postId={post.id} />
                    <PostContentForm initialData={post} postId={post.id} />
                    <PostSeoForm initialData={post} postId={post.id} />
                </div>
                <div>
                    <PostThumbnailForm initialData={post} postId={post.id} />
                </div>
            </div>
        </div>
    );
};

export default EditPost;
