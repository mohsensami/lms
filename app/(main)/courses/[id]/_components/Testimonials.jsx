import { SectionTitle } from '@/components/section-title';
import StarRating from '@/components/start-rating';
import UserAvatar from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck } from 'lucide-react';

const Testimonials = ({ testimonials }) => {
    return (
        <section className="py-8 md:py-12">
            <div className="container">
                <SectionTitle className="mb-6">نظرات دانشجویان</SectionTitle>

                {testimonials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">هنوز دیدگاهی برای این دوره تایید نشده است.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {testimonials.map((testimonial) => (
                            <blockquote
                                key={testimonial.id}
                                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        src={testimonial?.user?.profilePicture}
                                        alt={testimonial?.user?.firstName || 'کاربر'}
                                        className="h-12 w-12"
                                    />
                                    <div>
                                        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                            {testimonial?.user?.firstName} {testimonial?.user?.lastName}
                                        </p>
                                        <div className="mt-0.5 flex gap-0.5">
                                            <StarRating rating={testimonial?.rating} />
                                        </div>
                                    </div>
                                </div>
                                {testimonial?.isVerifiedBuyer && (
                                    <Badge variant="success" className="mt-3 inline-flex items-center gap-1 font-normal">
                                        <BadgeCheck className="h-3.5 w-3.5" />
                                        خریدار این دوره
                                    </Badge>
                                )}
                                <p className="mt-4 leading-7 text-muted-foreground">{testimonial?.content}</p>
                                {testimonial?.reply && (
                                    <div className="mt-4 rounded-xl bg-muted/60 p-4 text-sm">
                                        <span className="font-semibold text-primary">پاسخ مدرس/پشتیبانی: </span>
                                        <span className="text-foreground/90">{testimonial.reply}</span>
                                    </div>
                                )}
                            </blockquote>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;
