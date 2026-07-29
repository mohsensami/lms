'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StudentOverviewCard from '../../../component/student-overview-card';

function StudentDetailsToggle({ overview }) {
    const [open, setOpen] = useState(false);

    if (!overview || overview.courses.length === 0) {
        return <span className="text-xs text-muted-foreground">هنوز در هیچ دوره‌ای ثبت‌نام نکرده</span>;
    }

    return (
        <div className="w-full">
            <Button size="sm" variant="ghost" onClick={() => setOpen((prev) => !prev)}>
                {open ? <ChevronUp className="h-4 w-4 ml-1.5" /> : <ChevronDown className="h-4 w-4 ml-1.5" />}
                {open ? 'بستن جزئیات دوره‌ها' : `مشاهده دوره‌ها (${overview.courses.length})`}
            </Button>
            {open && (
                <div className="mt-3">
                    <StudentOverviewCard overview={overview} hideHeader canGrantAccess />
                </div>
            )}
        </div>
    );
}

export default StudentDetailsToggle;
