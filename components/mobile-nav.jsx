'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import Logo from './logo';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const MobileNav = ({ items, open, onOpenChange }) => {
    const { data: session } = useSession();
    const [loginSession, setLoginSession] = useState(null);

    useEffect(() => {
        setLoginSession(session);
    }, [session]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-3/4 flex-col gap-6 sm:max-w-sm">
                <SheetHeader>
                    <SheetTitle>
                        <Logo className="max-w-[140px]" />
                    </SheetTitle>
                </SheetHeader>

                <nav className="grid grid-flow-row auto-rows-auto gap-1 text-sm">
                    {items?.map((item, index) => (
                        <SheetClose asChild key={index}>
                            <Link
                                href={item.disable ? '#' : item.href}
                                className={cn(
                                    'flex w-full items-center rounded-xl p-3 text-sm font-semibold transition-colors hover:bg-primary/10 hover:text-primary',
                                    item.disable && 'cursor-not-allowed opacity-60',
                                )}
                            >
                                {item.title}
                            </Link>
                        </SheetClose>
                    ))}
                </nav>

                {!loginSession && (
                    <div className="flex items-center gap-2">
                        <SheetClose asChild>
                            <Link
                                href="/login"
                                className={cn(buttonVariants({ size: 'sm' }), 'flex-1 rounded-full font-semibold')}
                            >
                                ورود
                            </Link>
                        </SheetClose>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 rounded-full font-semibold">
                                    ثبت نام
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-4">
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href="/register/student">دانشجو</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href="/register/instructor">مدرس</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default MobileNav;
