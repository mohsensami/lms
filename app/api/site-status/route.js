import { getSiteStatus } from '@/lib/site-status';

// Read by the middleware (which can't query the database itself) to find out
// whether the site is closed to guests. Exposes nothing but that one flag.
export const dynamic = 'force-dynamic';

export async function GET() {
    let closed = false;
    try {
        closed = (await getSiteStatus()).closed;
    } catch {
        closed = false;
    }
    return Response.json({ closed }, { headers: { 'Cache-Control': 'no-store' } });
}
