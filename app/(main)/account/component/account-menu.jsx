'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const studentMenu = [
  { label: "پروفایل", href: "/account" },
  { label: "داشبورد", href: "/account/dashboard" },
  { label: "فاکتورهای من", href: "/account/Order" },
  { label: "دیدگاه‌های من", href: "/account/my-comments" },
  { label: "دوره‌های ثبت‌نامی", href: "/account/enrolled-courses" },
  { label: "آزمون‌ها و مدارک", href: "/account/certificates" },
];

const instructorMenu = [
  { label: "داشبورد", href: "/account/dashboard" },
  { label: "مقالات", href: "/account/posts" },
  { label: "دوره‌ها", href: "/account/courses" },
  { label: "دانشجوهای من", href: "/account/students" },
  { label: "پروفایل", href: "/account" },
  { label: "دیدگاه‌ها", href: "/account/comments" },
  { label: "آزمون‌ساز", href: "/account/quiz-sets" },
  { label: "درخواست‌های مدرک", href: "/account/certificate-requests" },
];

const adminMenu = [
  { label: "داشبورد", href: "/account/dashboard" },
  { label: "پروفایل", href: "/account" },
  { label: "کاربران", href: "/account/users" },
  { label: "دوره‌ها", href: "/account/courses" },
  { label: "مقالات", href: "/account/posts" },
  { label: "دیدگاه‌ها", href: "/account/comments" },
  { label: "آزمون‌ساز", href: "/account/quiz-sets" },
  { label: "درخواست‌های مدرک", href: "/account/certificate-requests" },
  { label: "فاکتورها", href: "/account/Order" },
];

function Menu({ role }) {
  const pathname = usePathname();

  let menu = studentMenu;
  if (role === 'instructor') menu = instructorMenu;
  if (role === 'admin') menu = adminMenu;

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
}

export default Menu;
