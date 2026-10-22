import 'server-only';

export const ALLOWED_VIDEO_EXTENSIONS = {
    mp4: 'video/mp4',
    m4v: 'video/x-m4v',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
};

export function getExtension(filename = '') {
    const match = /\.([a-zA-Z0-9]{1,5})$/.exec(filename);
    return match ? match[1].toLowerCase() : '';
}

/** Resolve a trustworthy video content-type from the browser's claim + file name. */
export function resolveVideoContentType(filename, claimedType) {
    const ext = getExtension(filename);
    if (claimedType && claimedType.startsWith('video/')) return claimedType;
    return ALLOWED_VIDEO_EXTENSIONS[ext] || null;
}

/** Every lesson's objects live under this prefix; used to validate keys. */
export function lessonKeyPrefix(courseId, lessonId) {
    return `courses/${courseId}/lessons/${lessonId}/`;
}
