import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { getTicketWithMessages } from '@/queries/tickets';
import TicketThread from '../_components/ticket-thread';

export const dynamic = 'force-dynamic';

const TicketPage = async ({ params }) => {
    const { ticketId } = await params;
    const user = await getLoggedInUser();
    const isAdmin = user?.role === 'admin';

    const ticket = await getTicketWithMessages(ticketId);

    // A student only ever sees their own tickets; for anyone else it simply "doesn't exist".
    if (!ticket || (!isAdmin && ticket.userId !== user?.id)) {
        notFound();
    }

    return (
        <div className="p-6">
            <Link href="/account/tickets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
                <ArrowRight className="h-4 w-4" />
                بازگشت به تیکت‌ها
            </Link>
            <TicketThread ticket={ticket} isAdmin={isAdmin} />
        </div>
    );
};

export default TicketPage;
