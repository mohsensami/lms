'use client';

import { BarChart } from 'lucide-react';

import { BookOpen } from 'lucide-react';
import { SidebarItem } from './sidebar-item';
import { BookA } from 'lucide-react';
import { Radio } from 'lucide-react';

const routes = [
    {
        icon: BarChart,
        label: 'داشبورد',
        href: '/dashboard',
    },
    {
        icon: BookOpen,
        label: 'دوره ها',
        href: '/dashboard/courses',
    },
    {
        icon: BookOpen,
        label: 'افزودن دوره',
        href: '/dashboard/courses/add',
    },
    {
        icon: Radio,
        label: 'Live ها',
        href: '/dashboard/lives',
    },
    {
        icon: BookA,
        label: 'آزمون ها',
        href: '/dashboard/quiz-sets',
    },
];

export const SidebarRoutes = () => {
    // const pathname = usePathname();

    // const isTeacherPage = pathname?.includes("/teacher");

    // const routes = isTeacherPage ? teacherRoutes : guestRoutes;

    return (
        <div className="flex flex-col w-full">
            {routes.map((route) => (
                <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
            ))}
        </div>
    );
};
