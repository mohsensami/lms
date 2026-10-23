'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getPostState, POST_STATE_LABEL } from '@/lib/post-status';

export const columns = [
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    عنوان پست <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: 'category',
        header: 'دسته‌بندی',
        cell: ({ row }) =>
            row.original.category?.name ? (
                <Badge variant="outline">{row.original.category.name}</Badge>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    },
    {
        id: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
            const state = getPostState(row.original);
            return (
                <Badge variant={state === 'published' ? 'success' : state === 'scheduled' ? 'secondary' : 'outline'}>
                    {POST_STATE_LABEL[state]}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'publishedAt',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    تاریخ انتشار <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const value = row.original.status === 'draft' ? null : row.getValue('publishedAt');
            return (
                <div>
                    {value
                        ? new Date(value).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })
                        : '-'}
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const id = row.original.id;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-4 w-8 p-0">
                            <span className="sr-only">منو</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Link href={`/account/posts/${id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="h-4 w-4 ml-2" />
                                ویرایش
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
