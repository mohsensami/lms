import 'highlight.js/styles/github-dark.css';

// Renders already-sanitized post HTML (see lib/sanitize-post-html.js).
// Pure markup + CSS: server component safe, and also reused by the editor's
// live preview.
export function PostHtml({ html, className = '' }) {
    return (
        // eslint-disable-next-line react/no-danger
        <div className={`post-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
    );
}

/** Full post body: HTML if the author wrote HTML, plain text (legacy) otherwise. */
export function PostBody({ rendered, className = '' }) {
    if (!rendered?.isHtml) {
        return <div className={`whitespace-pre-line ${className}`}>{rendered?.text}</div>;
    }
    return <PostHtml html={rendered.html} className={className} />;
}
