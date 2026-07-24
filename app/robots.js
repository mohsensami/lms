import { SITE_URL } from '@/lib/seo';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/account', '/api', '/login', '/register', '/enroll-success'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
