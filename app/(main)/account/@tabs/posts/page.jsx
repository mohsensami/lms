import { getPostList } from '@/queries/posts';
import { requireRole } from '@/lib/require-role';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';
import Link from 'next/link';
import { Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const PostsPage = async () => {
    await requireRole('admin');
    const posts = await getPostList();

    return (
        <div className="p-6">
            <div className="flex justify-end">
                <Link href="/account/posts/categories">
                    <Button variant="outline" size="sm">
                        <Tags className="ml-1.5 h-4 w-4" />
                        مدیریت دسته‌بندی‌ها
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={posts} />
        </div>
    );
};

export default PostsPage;
