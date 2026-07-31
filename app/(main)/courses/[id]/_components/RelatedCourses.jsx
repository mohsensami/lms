import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PriceDisplay } from '@/components/price-display';
import { SectionTitle } from '@/components/section-title';

const RelatedCourses = ({ relatedCourses }) => {
    return (
        <section>
            <div className="container">
                <SectionTitle className="mb-6">دوره‌های مرتبط</SectionTitle>
                <Carousel
                    opts={{
                        align: 'start',
                    }}
                    className="max-2xl:w-[90%] w-full mx-auto"
                >
                    <CarouselPrevious className="border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground" />
                    <CarouselNext className="border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground" />
                    <CarouselContent>
                        {relatedCourses.map((course) => (
                            <CarouselItem key={course._id} className="md:basis-1/2 lg:basis-1/3">
                                <Link href={`/courses/${course._id.toString()}`}>
                                    <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                                            <Image
                                                src={`/assets/images/courses/${course.thumbnail}`}
                                                alt={course.title}
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                fill
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 pt-3">
                                            <div className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary">
                                                {course.title}
                                            </div>
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                توسعه
                                            </p>
                                            <div className="mt-1 flex items-center justify-between">
                                                <PriceDisplay course={course} priceClassName="text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};

export default RelatedCourses;
