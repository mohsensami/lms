import { Suspense } from 'react';
import { Navbar } from './_components/navbar';
import Sidebar from './_components/sidebar';
import DashboardLoading from './loading';

export const dynamic = 'force-dynamic';

const DashboardLayout = ({ children }) => {
    return (
        <div className="h-full">
            <div className="h-[80px] lg:pr-56 fixed inset-y-0 w-full z-50">
                <Navbar />
            </div>
            <div className="hidden lg:flex h-full w-56 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>
            <main className="lg:pr-56 pt-[80px] h-full">
                <Suspense fallback={<DashboardLoading />}>{children}</Suspense>
            </main>
        </div>
    );
};
export default DashboardLayout;
