import { getPostList, getPostListForAuthor } from '@/queries/posts';
import { requireRole } from '@/lib/require-role';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';

export const dynamic = 'force-dynamic';

const PostsPage = async () => {
    const user = await requireRole('instructor');
    const posts = user.role === 'admin' ? await getPostList() : await getPostListForAuthor(user.id);

    return (
        <div className="p-6">
            <DataTable columns={columns} data={posts} />
        </div>
    );
};

export default PostsPage;
