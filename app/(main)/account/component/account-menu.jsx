'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const menu = [
<<<<<<< HEAD
  { label: "پروفایل", href: "/account" },
  { label: "دوره‌های ثبت‌نامی", href: "/account/enrolled-courses" },
];

function Menu() {
  const pathname = usePathname();
  return (
    <ul className="list-none sidebar-nav mb-0 mt-3 space-y-1" id="navmenu-nav">
      {menu.map((item, i) => (
        <li className="navbar-item account-menu" key={i}>
          <Link
            href={item.href}
            className={`navbar-link flex items-center rounded-xl px-3 py-2.5 font-semibold transition-colors ${
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <h6 className="mb-0">{item?.label}</h6>
          </Link>
        </li>
      ))}
      <li className="navbar-item account-menu">
        <Link
          href="#"
          onClick={() => {
            signOut();
          }}
          className="navbar-link flex items-center rounded-xl px-3 py-2.5 font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <h6 className="mb-0">خروج از حساب</h6>
        </Link>
      </li>
    </ul>
  );
=======
    { label: 'Profile', href: '/account' },
    { label: 'Enrolled Courses', href: '/account/enrolled-courses' },
];

function Menu() {
    const pathname = usePathname();
    return (
        <ul className="list-none sidebar-nav mb-0 mt-3" id="navmenu-nav">
            {menu.map((item, i) => (
                <li className="navbar-item account-menu" key={i}>
                    <Link
                        href={item.href}
                        className={`navbar-link flex items-center py-2 rounded ${
                            pathname === item.href ? 'text-primary' : 'text-slate-400'
                        }`}
                    >
                        <h6 className="mb-0 font-semibold">{item?.label}</h6>
                    </Link>
                </li>
            ))}
            <li className="navbar-item account-menu">
                <Link
                    href="#"
                    onClick={() => {
                        signOut();
                    }}
                    className="navbar-link text-slate-400 flex items-center py-2 rounded"
                >
                    <h6 className="mb-0 font-semibold">خروج</h6>
                </Link>
            </li>
        </ul>
    );
>>>>>>> farsi
}

export default Menu;
