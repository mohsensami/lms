// Shared (client + server) helpers for the WordPress-style publishing
// workflow of blog posts.
//
//   status = "draft"                         -> پیش‌نویس (never public)
//   status = "published" & publishedAt > now -> زمان‌بندی‌شده (scheduled)
//   status = "published" & publishedAt <= now -> منتشرشده (live)

export const POST_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
};

export function isPostLive(post, now = new Date()) {
    if (!post || post.status !== POST_STATUS.PUBLISHED) return false;
    const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
    if (!publishedAt || Number.isNaN(publishedAt.getTime())) return false;
    return publishedAt.getTime() <= now.getTime();
}

/** 'draft' | 'scheduled' | 'published' */
export function getPostState(post, now = new Date()) {
    if (!post || post.status !== POST_STATUS.PUBLISHED) return 'draft';
    return isPostLive(post, now) ? 'published' : 'scheduled';
}

export const POST_STATE_LABEL = {
    draft: 'پیش‌نویس',
    scheduled: 'زمان‌بندی‌شده',
    published: 'منتشرشده',
};

/**
 * Turns the publish picker's value ({ mode, date }) into the fields stored
 * on the Post. `keepPublishedAt` is the already-live post's current date, so
 * saving an edit doesn't silently move a live post to "now".
 */
export function buildPublishPayload({ mode, date }, { keepPublishedAt } = {}) {
    if (mode === 'draft') {
        return { status: POST_STATUS.DRAFT, publishedAt: new Date().toISOString() };
    }
    if (mode === 'schedule') {
        const d = date ? new Date(date) : null;
        if (!d || Number.isNaN(d.getTime())) {
            throw new Error('تاریخ و ساعت انتشار معتبر نیست');
        }
        return { status: POST_STATUS.PUBLISHED, publishedAt: d.toISOString() };
    }
    return {
        status: POST_STATUS.PUBLISHED,
        publishedAt: keepPublishedAt ? new Date(keepPublishedAt).toISOString() : new Date().toISOString(),
    };
}
