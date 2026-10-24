import 'server-only';

/**
 * "Simple link" storage: nothing is uploaded here. The admin hosts the video
 * somewhere else (any CDN, Aparat, YouTube, a plain .mp4 URL ...) and just
 * pastes the link on the lesson. The link is kept in Lesson.video_url and is
 * only revealed by /api/video/[lessonId] after the access check.
 */
export class LinkDriver {
    constructor(config) {
        this.id = config.id;
        this.type = 'link';
    }

    async deleteObject() {
        // nothing is stored by us
    }

    async testConnection() {
        return true;
    }
}
