'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const studentMenu = [
  { label: "پروفایل", href: "/account" },
  { label: "داشبورد", href: "/account/dashboard" },
  { label: "پیشرفت من", href: "/account/progress" },
  { label: "فاکتورهای من", href: "/account/Order" },
  { label: "دیدگاه‌های من", href: "/account/my-comments" },
  { label: "دوره‌های ثبت‌نامی", href: "/account/enrolled-courses" },
  { label: "تیکت‌ها", href: "/account/tickets", badgeKey: "tickets" },
  { label: "آزمون‌ها و مدارک", href: "/account/certificates" },
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
  { label: "پیام‌ها", href: "/account/messages", badgeKey: "unreadMessages" },
  { label: "تیکت‌ها", href: "/account/tickets", badgeKey: "tickets" },
  { label: "تنظیمات", href: "/account/settings" },
];

function Menu({ role, unreadMessages = 0, tickets = 0 }) {
  const pathname = usePathname();

  let menu = studentMenu;
  if (role === 'admin') menu = adminMenu;

  return (
    <ul className="list-none sidebar-nav mb-0 mt-3 space-y-1" id="navmenu-nav">
      {menu.map((item, i) => (
        <li className="navbar-item account-menu" key={i}>
          <Link
            href={item.href}
            className={`navbar-link flex items-center rounded-xl px-3 py-2.5 font-semibold transition-colors ${
              pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href + "/"))
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <h6 className="mb-0">{item?.label}</h6>
            {(() => {
              const count = item?.badgeKey === "unreadMessages" ? unreadMessages : item?.badgeKey === "tickets" ? tickets : 0;
              return count > 0 ? (
                <span className="me-auto ms-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {count.toLocaleString("fa-IR")}
                </span>
              ) : null;
            })()}
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
