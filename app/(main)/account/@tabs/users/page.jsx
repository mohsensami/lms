import { requireRole } from '@/lib/require-role';
import { getAllUsers } from '@/queries/users';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/user-avatar';
import UserRowActions from './_components/user-row-actions';

export const dynamic = 'force-dynamic';

const ROLE_LABEL = {
    admin: 'مدیر',
    instructor: 'مدرس',
    student: 'دانشجو',
};

const UsersPage = async () => {
    const admin = await requireRole('admin');
    const users = await getAllUsers();

    return (
        <div className="p-6">
            <div className="flex flex-col gap-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar src={user.profilePicture} alt={user.firstName} className="h-11 w-11 shrink-0" />
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                    {user.firstName} {user.lastName}
                                    {user.id === admin.id && (
                                        <span className="mr-2 text-xs font-normal text-muted-foreground">(شما)</span>
                                    )}
                                </p>
                                <p className="truncate text-sm text-muted-foreground" dir="ltr">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{ROLE_LABEL[user.role] || user.role}</Badge>
                            <Badge variant={user.isActive === false ? 'destructive' : 'success'}>
                                {user.isActive === false ? 'غیرفعال' : 'فعال'}
                            </Badge>
                        </div>

                        {user.id === admin.id ? (
                            <span className="text-xs text-muted-foreground">
                                برای غیرفعال‌سازی/حذف حساب خودتان، از حساب مدیر دیگری استفاده کنید.
                            </span>
                        ) : (
                            <UserRowActions userId={user.id} isActive={user.isActive !== false} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersPage;
