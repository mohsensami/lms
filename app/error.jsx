'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // اینجا می‌تونی خطا رو به سرویس مانیتورینگ (Sentry, LogRocket, ...) ارسال کنی
        console.error('خطای غیرمنتظره:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900">مشکلی پیش آمد</h2>

            <p className="max-w-md text-sm text-gray-500">
                متأسفانه در بارگذاری این بخش خطایی رخ داد. می‌تونید دوباره تلاش کنید یا اگر مشکل ادامه داشت، با پشتیبانی
                تماس بگیرید.
            </p>

            {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 max-w-lg overflow-auto rounded-md bg-gray-100 p-3 text-left text-xs text-gray-700">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                </pre>
            )}

            <div className="mt-2 flex gap-3">
                <button
                    onClick={() => reset()}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    تلاش دوباره
                </button>
                <button
                    onClick={() => (window.location.href = '/')}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    بازگشت به خانه
                </button>
            </div>
        </div>
    );
}
