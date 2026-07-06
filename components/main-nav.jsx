'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

import { X } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import MobileNav from './mobile-nav';
import { useSession, signOut } from 'next-auth/react';

const MainNav = ({ items, children }) => {
    const { data: session } = useSession();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [loginSession, setLoginSession] = useState(null);

    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        setLoginSession(session);
        async function fetchMe() {
            try {
                const response = await fetch('/api/me');
                const data = await response.json();
                // console.log(data);
                setLoggedInUser(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchMe();
    }, [session]);

    return (
        <>
            <div className="flex gap-6 lg:gap-10">
                <Link href="/">
                    <Logo />
                </Link>
                {items?.length ? (
                    <nav className="hidden gap-6 lg:flex">
                        {items?.map((item, index) => (
                            <Link
                                key={index}
                                href={item.disable ? '#' : item.href}
                                className={cn(
                                    'flex items-center text-sm font-semibold text-foreground/70 transition-colors hover:text-primary',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                ) : null}

                {showMobileMenu && items && <MobileNav items={items}>{children}</MobileNav>}
            </div>

            <nav className="flex items-center gap-3">
                {!loginSession && (
                    <div className="items-center gap-2 hidden lg:flex">
                        <Link
                            href="/login"
                            className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-5 font-semibold shadow-sm shadow-primary/20')}
                        >
                            ورود
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-full px-5 font-semibold">
                                    ثبت نام
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-4">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/register/student">دانش آموز</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/register/instructor">استاد</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {loginSession && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer rounded-full ring-2 ring-transparent transition hover:ring-primary/40">
                                <Avatar>
                                    <AvatarImage src={loggedInUser?.profilePicture} alt="@ariyan" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 mt-4">
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href="/account">پروفایل</Link>
                            </DropdownMenuItem>

                            {loggedInUser?.role === 'instructor' && (
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href="/dashboard">
                                        {' '}
                                        <strong>داشبورد اساتید</strong>{' '}
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href="/account/enrolled-courses">دوره های من</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href="">گواهی‌نامه‌ها و نظرات مشتریان</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link
                                    href=""
                                    onClick={(e) => {
                                        e.preventDefault();
                                        signOut();
                                    }}
                                >
                                    خروج
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <button
                    className="flex items-center justify-center rounded-full border border-border p-2 text-foreground/70 transition hover:border-primary hover:text-primary lg:hidden"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>
        </>
    );
};

export default MainNav;
