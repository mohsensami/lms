import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NewTicketForm from '../_components/new-ticket-form';

const NewTicketPage = () => (
    <div className="p-6">
        <Link href="/account/tickets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
            <ArrowRight className="h-4 w-4" />
            بازگشت به تیکت‌ها
        </Link>
        <h4 className="mb-1 text-xl font-bold text-foreground">ثبت تیکت جدید</h4>
        <p className="mb-6 text-sm text-muted-foreground">مشکل یا سوال خود را بنویسید. پاسخ پشتیبانی را همین‌جا و از طریق ایمیل دریافت می‌کنید.</p>
        <div className="max-w-3xl">
            <NewTicketForm />
        </div>
    </div>
);

export default NewTicketPage;
