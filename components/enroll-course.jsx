'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Loader2, Wallet } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getCheckoutGateways, startCheckout } from '../app/actions/payment';

const GATEWAY_ICONS = { zarinpal: CreditCard, bale: Wallet };

const EnrollCourse = ({ asLink, courseId, isLoggedIn = true }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false); // fetching the gateway list
    const [paying, setPaying] = useState(false); // redirecting to the gateway
    const [gateways, setGateways] = useState([]);
    const [selected, setSelected] = useState(null);

    async function pay(gatewayId) {
        setPaying(true);
        try {
            const result = await startCheckout(courseId, gatewayId);
            if (!result?.ok) {
                toast.error(result?.message || 'شروع پرداخت ممکن نشد.');
                setPaying(false);
                return;
            }
            window.location.assign(result.url);
        } catch {
            toast.error('مشکلی پیش آمد. دوباره تلاش کنید.');
            setPaying(false);
        }
    }

    // One enabled gateway -> go straight to it. Several -> let the customer pick.
    async function handleStart() {
        setLoading(true);
        try {
            const list = await getCheckoutGateways();
            if (list.length === 0) {
                toast.error('در حال حاضر هیچ درگاه پرداختی فعال نیست. با پشتیبانی تماس بگیرید.');
            } else if (list.length === 1) {
                await pay(list[0].id);
            } else {
                setGateways(list);
                setSelected(list[0].id);
                setOpen(true);
            }
        } catch {
            toast.error('مشکلی پیش آمد. دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    }

    // Not logged in yet — send them to login instead of letting the
    // payment action fail.
    if (!isLoggedIn) {
        const loginHref = `/login?callbackUrl=/courses/${courseId}`;
        return asLink ? (
            <Link
                href={loginHref}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-secondary px-3 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
                ثبت نام
                <ArrowLeft className="w-3" />
            </Link>
        ) : (
            <Link
                href={loginHref}
                className={cn(
                    buttonVariants({ size: 'lg' }),
                    'w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25',
                )}
            >
                ثبت نام در دوره
            </Link>
        );
    }

    const busy = loading || paying;

    return (
        <>
            {asLink ? (
                <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={handleStart}
                    className="h-8 gap-1 rounded-full text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                >
                    {loading ? <Loader2 className="w-3 animate-spin" /> : null}
                    ثبت نام
                    <ArrowLeft className="w-3" />
                </Button>
            ) : (
                <Button
                    type="button"
                    disabled={busy}
                    onClick={handleStart}
                    className={cn(
                        buttonVariants({ size: 'lg' }),
                        'w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25',
                    )}
                >
                    {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    ثبت نام در دوره
                </Button>
            )}

            <Dialog open={open} onOpenChange={(next) => !paying && setOpen(next)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-start">
                        <DialogTitle>انتخاب روش پرداخت</DialogTitle>
                        <DialogDescription>درگاه مورد نظر خود را برای پرداخت انتخاب کنید.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3" role="radiogroup" aria-label="درگاه پرداخت">
                        {gateways.map((gateway) => {
                            const Icon = GATEWAY_ICONS[gateway.id] || CreditCard;
                            const active = selected === gateway.id;
                            return (
                                <button
                                    key={gateway.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    disabled={paying}
                                    onClick={() => setSelected(gateway.id)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-colors',
                                        active
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                            : 'border-border hover:border-primary/40',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                            active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/70',
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-foreground">{gateway.label}</span>
                                        <span className="block text-xs text-muted-foreground">{gateway.description}</span>
                                    </span>
                                    <span
                                        className={cn(
                                            'h-4 w-4 shrink-0 rounded-full border-2',
                                            active ? 'border-primary bg-primary' : 'border-muted-foreground/40',
                                        )}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button type="button" disabled={paying || !selected} onClick={() => pay(selected)}>
                            {paying && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            پرداخت
                        </Button>
                        <Button type="button" variant="ghost" disabled={paying} onClick={() => setOpen(false)}>
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EnrollCourse;
