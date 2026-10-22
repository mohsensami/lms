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
];
