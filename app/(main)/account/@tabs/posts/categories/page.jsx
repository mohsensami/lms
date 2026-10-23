import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireRole } from '@/lib/require-role';
import { getPostCategories } from '@/queries/post-categories';
import CategoryManager from './_components/category-manager';

export const dynamic = 'force-dynamic';

const PostCategoriesPage = async () => {
    await requireRole('admin');
    const categories = await getPostCategories();

    return (
        <div className="p-6">
            <Link
                href="/account/posts"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
            >
                <ArrowRight className="h-4 w-4" />
                بازگشت به مقالات
            </Link>
            <h4 className="mb-1 text-xl font-bold text-foreground">دسته‌بندی مقالات</h4>
            <p className="mb-6 text-sm text-muted-foreground">
                برای هر مقاله می‌توانید یک دسته‌بندی انتخاب کنید؛ بازدیدکنندگان در وبلاگ بر اساس دسته فیلتر می‌کنند.
            </p>
            <CategoryManager categories={categories} />
        </div>
    );
};

export default PostCategoriesPage;
