'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquareReply } from 'lucide-react';

function CommentReplyBox({ commentId, initialReply, onReply }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialReply || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onReply(commentId, value);
            toast.success('پاسخ ثبت شد');
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            toast.error(error?.message || 'مشکلی پیش آمد');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="mt-3">
                {initialReply && (
                    <div className="rounded-xl bg-muted/60 p-3 text-sm text-foreground/90">
                        <span className="font-semibold text-primary">پاسخ شما: </span>
                        {initialReply}
                    </div>
                )}
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => setIsEditing(true)}>
                    <MessageSquareReply className="h-4 w-4 ml-1.5" />
                    {initialReply ? 'ویرایش پاسخ' : 'پاسخ دادن'}
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-3 flex flex-col gap-2">
            <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={2}
                placeholder="پاسخ خود را بنویسید..."
                disabled={isSubmitting}
            />
            <div className="flex gap-2">
                <Button size="sm" disabled={isSubmitting} onClick={handleSubmit}>
                    ثبت پاسخ
                </Button>
                <Button size="sm" variant="outline" disabled={isSubmitting} onClick={() => setIsEditing(false)}>
                    انصراف
                </Button>
            </div>
        </div>
    );
}

export default CommentReplyBox;
