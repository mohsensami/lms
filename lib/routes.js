export const LOGIN = '/login';
export const ROOT = '/';

export const PUBLIC_ROUTES = [
    '/login',
    '/register/student',
    '/courses',
    '/api/register',
    '/blog',
    '/contact-us',
    '/about-us',
    // Access is checked inside the handler: free-preview videos are
    // watchable by guests, everything else requires purchase.
    '/api/video',
    // Called by Bale's servers (no login); protected by a secret in the URL.
    '/api/bale/webhook',
    // Only says whether the site is closed to guests; the middleware reads it.
    '/api/site-status',
];

// Paths a guest may still open while the site is closed (Settings -> وضعیت سایت):
// login + register, the auth/register APIs, the status flag the middleware
// reads, and the payment webhook (called by the bank, not by a visitor).
export const ALWAYS_OPEN_ROUTES = [
    '/login',
    '/register',
    '/api/auth',
    '/api/register',
    '/api/site-status',
    '/api/bale/webhook',
];
