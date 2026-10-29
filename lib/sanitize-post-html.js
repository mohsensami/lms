import 'server-only';
import sanitizeHtml from 'sanitize-html';
import hljs from 'highlight.js';
import { isHtmlContent } from '@/lib/post-content';

// Post bodies are author-written HTML. Authors are trusted staff, but we
// still sanitize at render time so a stray <script>/onerror can never reach
// readers (and so tightening this list applies to old posts too).
const SANITIZE_OPTIONS = {
    allowedTags: [
        ...sanitizeHtml.defaults.allowedTags,
        'h1',
        'h2',
        'img',
        'figure',
        'figcaption',
        'span',
        'u',
        's',
        'del',
        'ins',
        'mark',
        'small',
        'sub',
        'sup',
        'kbd',
        'details',
        'summary',
        'iframe',
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target', 'rel', 'title'],
        // `class` is only allowed where syntax highlighting needs it (and
        // then only language-* values, see allowedClasses below).
        pre: ['class'],
        code: ['class'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder'],
        td: ['colspan', 'rowspan'],
        th: ['colspan', 'rowspan'],
        ol: ['start', 'type'],
        '*': ['dir', 'lang', 'id', 'style'],
    },
    // Only syntax-highlighting classes survive; arbitrary utility classes
    // (e.g. "fixed inset-0") can't be used to break the page layout.
    allowedClasses: {
        pre: ['language-*'],
        code: ['language-*'],
    },
    allowedStyles: {
        '*': {
            'text-align': [/^(left|right|center|justify)$/],
            direction: [/^(ltr|rtl)$/],
            color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i],
            width: [/^\d+(\.\d+)?(px|%)$/],
            'max-width': [/^\d+(\.\d+)?(px|%)$/],
        },
    },
    // Drop iframes whose src was rejected (not an allowed video host).
    exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'www.aparat.com'],
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
        }),
        img: (tagName, attribs) => ({ tagName, attribs: { loading: 'lazy', ...attribs } }),
    },
};

function unescapeHtml(text) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
}

// Matches <pre><code class="language-xxx">…</code></pre> (the shape the editor
// inserts). A block without a language is left as plain, escaped code.
const CODE_BLOCK_RE = /<pre(?:\s[^>]*)?>\s*<code(?:\s+class="language-([\w+#-]+)")?\s*>([\s\S]*?)<\/code>\s*<\/pre>/g;

// Highlight code blocks on the server with highlight.js, so readers get fully
// coloured code with zero client-side JS. Unknown languages stay uncoloured.
function highlightCodeBlocks(html) {
    return html.replace(CODE_BLOCK_RE, (match, lang, escapedCode) => {
        const language = lang && hljs.getLanguage(lang) ? lang : null;
        const raw = unescapeHtml(escapedCode).replace(/^\n/, '').replace(/\s+$/, '');
        let body = escapedCode;
        if (language) {
            try {
                body = hljs.highlight(raw, { language, ignoreIllegals: true }).value;
            } catch {
                body = escapedCode;
            }
        }
        const cls = language ? ` language-${language}` : '';
        return `<pre dir="ltr"><code class="hljs${cls}">${body}</code></pre>`;
    });
}

/**
 * Returns what a post body should render as.
 *   { isHtml: false, text }  -> legacy plain-text body (shown with line breaks)
 *   { isHtml: true,  html }  -> sanitized + highlight.js-highlighted HTML
 */
export function renderPostContent(content) {
    if (!content) return { isHtml: false, text: '' };
    if (!isHtmlContent(content)) return { isHtml: false, text: content };
    return { isHtml: true, html: highlightCodeBlocks(sanitizeHtml(content, SANITIZE_OPTIONS)) };
}
