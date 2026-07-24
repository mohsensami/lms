import { getCourseList } from '@/queries/courses';
import { getPostList } from '@/queries/posts';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap() {
    const [courses, posts] = await Promise.all([getCourseList(), getPostList()]);

    const staticRoutes = [
        { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/courses`, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    ];

    const courseRoutes = (courses || []).map((course) => ({
        url: `${SITE_URL}/courses/${course.id}`,
        lastModified: course.modifiedOn || course.createdOn,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const postRoutes = (posts || []).map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...courseRoutes, ...postRoutes];
}
