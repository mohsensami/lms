'use client';

import { AppProgressProvider } from '@bprogress/next';

export function ProgressProvider({ children }) {
    return (
        <AppProgressProvider height="5px" color="#4f46e5" options={{ showSpinner: false }} shallowRouting>
            {children}
        </AppProgressProvider>
    );
}
