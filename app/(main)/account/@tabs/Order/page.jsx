import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/queries/users';
import { getOrdersForUser } from '@/queries/orders';
import OrderCard from '../../component/order-card';

async function Orders() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const loggedInUser = await getUserByEmail(session?.user?.email);
    const orders = await getOrdersForUser(loggedInUser?.id);

    return (
        <div className="flex flex-col gap-4">
            {orders && orders.length > 0 ? (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
                <div className="font-bold bg-red-400 text-white p-2 w-100">هنوز هیچ فاکتوری برای شما ثبت نشده است!</div>
            )}
        </div>
    );
}

export default Orders;
