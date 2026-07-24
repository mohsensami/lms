import { getPostList } from '@/queries/posts';
import { requireRole } from '@/lib/require-role';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';

export const dynamic = 'force-dynamic';

const PostsPage = async () => {
    await requireRole('admin');
    const posts = await getPostList();

    return (
        <div className="p-6">
            <DataTable columns={columns} data={posts} />
        </div>
    );
};

export default PostsPage;
