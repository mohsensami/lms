// Plain helpers for post bodies (usable on server and client).
//
// Post bodies are plain text OR author-written HTML (the editor field is a
// plain textarea). These helpers keep excerpts / read-time sane for both.

const HTML_TAG_RE = /<\/?[a-z][a-z0-9-]*(\s[^>]*)?>/i;

export function isHtmlContent(content) {
    return typeof content === 'string' && HTML_TAG_RE.test(content);
}

function decodeBasicEntities(text) {
    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
}

/** Text-only version of a body. Code blocks / scripts / styles are dropped. */
export function stripHtml(content) {
    if (!content) return '';
    if (!isHtmlContent(content)) return content;
    const withoutBlocks = content
        .replace(/<(script|style|pre)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, ' ')
        .replace(/<[^>]*>/g, ' ');
    return decodeBasicEntities(withoutBlocks).replace(/\s+/g, ' ').trim();
}

export function getPostExcerpt(content, maxLength = 160) {
    const plain = stripHtml(content).replace(/\s+/g, ' ').trim();
    if (!plain) return '';
    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trim()}…`;
}

export function getPostReadTime(content) {
    const plain = stripHtml(content);
    if (!plain) return '۱ دقیقه';
    const words = plain.split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes.toLocaleString('fa-IR')} دقیقه`;
}
