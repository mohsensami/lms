'use client';

import { AppProgressProvider } from '@bprogress/next';

export function ProgressProvider({ children }) {
    return (
        <AppProgressProvider height="3px" color="#4f46e5" options={{ showSpinner: false }} shallowRouting>
            {children}
        </AppProgressProvider>
    );
}
