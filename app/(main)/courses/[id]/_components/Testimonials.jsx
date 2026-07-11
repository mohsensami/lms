import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { SectionTitle } from '@/components/section-title';
import StarRating from '@/components/start-rating';
import UserAvatar from '@/components/user-avatar';

const Testimonials = ({ testimonials }) => {
    return (
        <section className="py-8 md:py-12">
            <div className="container">
                <SectionTitle className="mb-6">نظرات دانشجویان</SectionTitle>
                <Carousel
                    opts={{
                        align: 'start',
                    }}
                    className="max-2xl:w-[90%] w-full mx-auto"
                >
                    <CarouselPrevious className="border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground" />
                    <CarouselNext className="border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground" />
                    <CarouselContent className="py-2">
                        {testimonials.map((testimonial) => (
                            <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                                <blockquote className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar
                                            src={testimonial?.user?.profilePicture}
                                            alt={testimonial?.user?.firstName || 'کاربر'}
                                            className="h-12 w-12"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                {testimonial?.user?.firstName} {testimonial?.user?.lastName}
                                            </p>
                                            <div className="mt-0.5 flex gap-0.5">
                                                <StarRating rating={testimonial?.rating} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 leading-7 text-muted-foreground">{testimonial?.content}</p>
                                </blockquote>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};

export default Testimonials;
