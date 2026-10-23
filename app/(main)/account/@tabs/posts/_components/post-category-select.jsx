'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NONE = '__none__';

/** Controlled category picker. `value` is a category id or "" (no category). */
export function PostCategorySelect({ categories = [], value, onChange, disabled }) {
    return (
        <Select value={value || NONE} onValueChange={(next) => onChange(next === NONE ? '' : next)} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder="انتخاب دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={NONE}>بدون دسته‌بندی</SelectItem>
                {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
