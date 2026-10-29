import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

/**
 * Sidebar of the blog post page: every category as an accordion item that
 * lists all of its public posts. The category of the post being read is
 * open by default and the current post is highlighted.
 */
export default function CategoryPostsSidebar({ groups, currentCategoryKey, currentSlug }) {
    if (!groups?.length) return null;

    const openKey = groups.some((g) => g.key === currentCategoryKey) ? currentCategoryKey : null;

    return (
        <nav aria-label="مقالات به تفکیک دسته‌بندی" className="rounded-2xl border border-border bg-card p-2 shadow-sm">
            <h2 className="flex items-center gap-2 px-3 pb-2 pt-3 text-sm font-extrabold text-foreground">
                <FolderOpen className="h-4 w-4 text-primary" />
                مقالات بر اساس دسته‌بندی
            </h2>

            <Accordion type="multiple" defaultValue={openKey ? [openKey] : []} className="w-full">
                {groups.map((group) => (
                    <AccordionItem key={group.key} value={group.key} className="border-b border-border/60 last:border-b-0">
                        <AccordionTrigger className="px-3 py-3 text-sm font-semibold hover:no-underline">
                            <span className="flex flex-1 items-center justify-between gap-2 text-start">
                                <span>{group.name}</span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    {group.posts.length.toLocaleString('fa-IR')}
                                </span>
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <ul className="flex max-h-80 flex-col gap-0.5 overflow-y-auto px-1">
                                {group.posts.map((item) => {
                                    const active = item.slug === currentSlug;
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={`/blog/${item.slug}`}
                                                aria-current={active ? 'page' : undefined}
                                                className={cn(
                                                    'block rounded-lg px-3 py-2 text-sm leading-6 transition-colors',
                                                    active
                                                        ? 'bg-primary/10 font-semibold text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                {item.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </nav>
    );
}
