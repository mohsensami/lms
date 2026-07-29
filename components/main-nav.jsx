'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

import { X } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import UserAvatar from './user-avatar';
import MobileNav from './mobile-nav';
import { useSession, signOut } from 'next-auth/react';

const roleMenus = {
    student: [
        { label: 'پروفایل', href: '/account' },
        { label: 'داشبورد', href: '/account/dashboard' },
        { label: 'دوره‌های ثبت‌نامی', href: '/account/enrolled-courses' },
        { label: 'فاکتورهای من', href: '/account/Order' },
    ],
    instructor: [
        { label: 'داشبورد', href: '/account/dashboard' },
        { label: 'مقالات', href: '/account/posts' },
        { label: 'دوره‌ها', href: '/account/courses' },
        { label: 'دیدگاه‌ها', href: '/account/comments' },
    ],
    admin: [
        { label: 'داشبورد', href: '/account/dashboard' },
        { label: 'کاربران', href: '/account/users' },
        { label: 'دوره‌ها', href: '/account/courses' },
        { label: 'دیدگاه‌ها', href: '/account/comments' },
    ],
};

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

    const quickMenu = roleMenus[loggedInUser?.role] || roleMenus.student;

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
            </div>

            {items && <MobileNav items={items} open={showMobileMenu} onOpenChange={setShowMobileMenu} />}

            <nav className="flex items-center gap-3">
                {!loginSession && (
                    <div className="items-center gap-2 hidden lg:flex">
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ size: 'sm' }),
                                'rounded-full px-5 font-semibold shadow-sm shadow-primary/20',
                            )}
                        >
                            ورود
                        </Link>
                        <Link
                            href="/register/student"
                            className={cn(
                                buttonVariants({ variant: 'outline', size: 'sm' }),
                                'rounded-full px-5 font-semibold',
                            )}
                        >
                            ثبت نام
                        </Link>
                    </div>
                )}

                {loginSession && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex cursor-pointer items-center gap-2 rounded-full px-1.5 py-1 ring-2 ring-transparent transition hover:ring-primary/40">
                                <UserAvatar src={loggedInUser?.profilePicture} alt={loggedInUser?.firstName} />
                                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-foreground/80 lg:inline">
                                    {loggedInUser?.firstName}
                                </span>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 mt-4">
                            {quickMenu.map((item) => (
                                <DropdownMenuItem key={item.href} className="cursor-pointer" asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </DropdownMenuItem>
                            ))}
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
