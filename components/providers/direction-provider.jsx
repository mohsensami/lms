'use client';

import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';

// Radix UI (Select, DropdownMenu, Popover, Tabs, Accordion, Toast, ...) does
// NOT read <html dir>; it takes its direction from this provider and
// defaults to LTR. Without it, menus open on the wrong side, arrow keys
// navigate backwards and popovers align to the left even on an RTL page.
export function DirectionProvider({ children, dir = 'rtl' }) {
    return <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>;
}
