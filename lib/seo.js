export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
);

export const SITE_NAME = 'آکادمی آموزشی';

export function getExcerpt(content, maxLength = 160) {
    if (!content) return '';
    const plain = content.replace(/\s+/g, ' ').trim();
    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trim()}…`;
}

/**
 * Builds a Next.js Metadata object for a blog post, preferring the
 * admin-entered metaTitle/metaDescription (Yoast-style overrides) and
 * falling back to the post's actual title/content when they're empty.
 */
export function buildPostMetadata(post) {
    if (!post) return {};

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || getExcerpt(post.content);
    const url = `${SITE_URL}/blog/${post.slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            type: 'article',
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
            ...(post.thumbnail ? { images: [{ url: post.thumbnail }] } : {}),
        },
        twitter: {
            card: post.thumbnail ? 'summary_large_image' : 'summary',
            title,
            description,
            ...(post.thumbnail ? { images: [post.thumbnail] } : {}),
        },
    };
}

/** JSON-LD structured data (schema.org BlogPosting) for a single post. */
export function buildPostJsonLd(post) {
    if (!post) return null;

    const url = `${SITE_URL}/blog/${post.slug}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.metaTitle || post.title,
        description: post.metaDescription || getExcerpt(post.content),
        datePublished: post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        ...(post.thumbnail ? { image: [post.thumbnail] } : {}),
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
        },
    };
}

/** Next.js Metadata for a course page. */
export function buildCourseMetadata(course) {
    if (!course) return {};

    const title = course.title;
    const description = getExcerpt(course.description, 160);
    const url = `${SITE_URL}/courses/${course.id}`;
    const image = course.thumbnail ? `${SITE_URL}/assets/images/courses/${course.thumbnail}` : null;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            type: 'website',
            ...(image ? { images: [{ url: image }] } : {}),
        },
        twitter: {
            card: image ? 'summary_large_image' : 'summary',
            title,
            description,
            ...(image ? { images: [image] } : {}),
        },
    };
}

/** JSON-LD structured data (schema.org Course) for a course page. */
export function buildCourseJsonLd(course) {
    if (!course) return null;

    const url = `${SITE_URL}/courses/${course.id}`;
    const image = course.thumbnail ? `${SITE_URL}/assets/images/courses/${course.thumbnail}` : undefined;
    const instructorName =
        course?.instructor?.firstName || course?.instructor?.lastName
            ? `${course?.instructor?.firstName || ''} ${course?.instructor?.lastName || ''}`.trim()
            : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: getExcerpt(course.description, 300) || course.title,
        url,
        ...(image ? { image } : {}),
        provider: {
            '@type': 'Organization',
            name: SITE_NAME,
            sameAs: SITE_URL,
        },
        ...(instructorName
            ? {
                  hasCourseInstance: {
                      '@type': 'CourseInstance',
                      courseMode: 'online',
                      instructor: { '@type': 'Person', name: instructorName },
                  },
              }
            : {}),
        ...(course.price
            ? {
                  offers: {
                      '@type': 'Offer',
                      price: course.price,
                      priceCurrency: 'IRR',
                      url,
                  },
              }
            : {}),
    };
}
