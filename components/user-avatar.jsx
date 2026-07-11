import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Single source of truth for "show the user's profile picture, or a plain
// user icon if they don't have one yet". Use this everywhere a profile
// picture is displayed instead of a raw <Avatar>/<Image>, so we never again
// render a broken image or a placeholder like "CN" / pravatar.cc.
const UserAvatar = ({ src, alt = 'کاربر', className, iconClassName }) => {
    return (
        <Avatar className={className}>
            {src && <AvatarImage src={src} alt={alt} className="object-cover" />}
            <AvatarFallback>
                <User className={cn('h-1/2 w-1/2 text-muted-foreground', iconClassName)} />
            </AvatarFallback>
        </Avatar>
    );
};

export default UserAvatar;
