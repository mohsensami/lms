'use client';

import { useEffect, useRef, useState } from 'react';
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PostImageUploader } from './post-image-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostBody } from '@/components/post-html';
import { previewPostContent } from '@/app/actions/post';

const CODE_LANGUAGES = [
    { value: 'matlab', label: 'MATLAB' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'java', label: 'Java' },
    { value: 'bash', label: 'Bash' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'HTML / XML' },
    { value: 'css', label: 'CSS' },
    { value: 'plaintext', label: 'متن ساده' },
];

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const altFromFileName = (name = '') =>
    name
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/"/g, '')
        .trim();

/**
 * The post body stays a plain <textarea> (you type/paste HTML in it). This
 * wrapper only adds helpers around it: insert uploaded images, insert a
 * code block (highlighted with highlight.js on the blog), and a live preview.
 *
 * `field` is the react-hook-form field object ({ value, onChange, ref, ... }).
 */
export function PostContentField({ field, disabled, rows = 22, placeholder = 'متن کامل مقاله (متن ساده یا HTML)' }) {
    const textareaRef = useRef(null);
    const [codeOpen, setCodeOpen] = useState(false);
    const [code, setCode] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('matlab');
    const [showPreview, setShowPreview] = useState(false);
    const [rendered, setRendered] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Insert text where the caret is (replacing any selection).
    const insertAtCursor = (snippet) => {
        const el = textareaRef.current;
        const current = field.value || '';
        const start = el?.selectionStart ?? current.length;
        const end = el?.selectionEnd ?? current.length;
        const next = current.slice(0, start) + snippet + current.slice(end);
        field.onChange(next);
        requestAnimationFrame(() => {
            if (!el) return;
            el.focus();
            const caret = start + snippet.length;
            el.setSelectionRange(caret, caret);
        });
    };

    const insertCodeBlock = () => {
        const trimmed = code.replace(/^\n+|\s+$/g, '');
        if (!trimmed) {
            toast.error('کد را وارد کنید');
            return;
        }
        insertAtCursor(`\n<pre><code class="language-${codeLanguage}">${escapeHtml(trimmed)}</code></pre>\n`);
        setCode('');
        setCodeOpen(false);
    };

    // Live preview: rendered on the server with the exact same sanitizer and
    // highlight.js highlighting the blog uses (debounced while typing).
    useEffect(() => {
        if (!showPreview) return undefined;
        let cancelled = false;
        setPreviewLoading(true);
        const timer = setTimeout(async () => {
            try {
                const result = await previewPostContent(field.value || '');
                if (!cancelled) setRendered(result);
            } catch {
                if (!cancelled) toast.error('پیش‌نمایش بارگذاری نشد');
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [showPreview, field.value]);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <PostImageUploader
                    endpoint="postContentImageUploader"
                    multiple
                    variant="secondary"
                    label="افزودن تصویر"
                    disabled={disabled}
                    onUploaded={(files) => {
                        const tags = files.map((file) => `<img src="${file.url}" alt="${altFromFileName(file.name)}" />`);
                        insertAtCursor(`\n${tags.join('\n')}\n`);
                        toast.success(tags.length > 1 ? 'تصاویر به متن اضافه شدند' : 'تصویر به متن اضافه شد');
                    }}
                />
                <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => setCodeOpen(true)}>
                    <Code2 className="ml-1.5 h-4 w-4" />
                    افزودن کد
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
                    {showPreview ? <EyeOff className="ml-1.5 h-4 w-4" /> : <Eye className="ml-1.5 h-4 w-4" />}
                    {showPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش'}
                </Button>
            </div>

            <Textarea
                rows={rows}
                dir="auto"
                disabled={disabled}
                placeholder={placeholder}
                className="resize-y font-mono"
                {...field}
                ref={(el) => {
                    field.ref?.(el);
                    textareaRef.current = el;
                }}
            />

            {showPreview && (
                <div className="rounded-md border bg-white p-4">
                    <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>پیش‌نمایش (همان چیزی که در وبلاگ نمایش داده می‌شود)</span>
                        {previewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {rendered ? (
                        <PostBody rendered={rendered} className="text-[15px] leading-8" />
                    ) : (
                        <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
                    )}
                </div>
            )}

            <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>افزودن کد</DialogTitle>
                        <DialogDescription>
                            کد را همین‌جا بنویسید یا پیست کنید؛ به‌صورت یک بلوک رنگی (highlight.js) در متن مقاله قرار می‌گیرد.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">زبان برنامه‌نویسی</label>
                        <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CODE_LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Textarea
                        dir="ltr"
                        rows={12}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={"% Example\nt = 0:0.01:1;\ny = sin(2*pi*5*t);\nplot(t, y);"}
                        className="font-mono text-left"
                        spellCheck={false}
                    />
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => setCodeOpen(false)}>
                            انصراف
                        </Button>
                        <Button type="button" onClick={insertCodeBlock}>
                            درج در متن
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
