import { SectionTitle } from '@/components/section-title';

import { Button, buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/utils';
import { getCourseList } from '@/queries/courses';
import { ArrowLeftIcon, BookOpen } from 'lucide-react';
import { ArrowRightIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CourseCard from './courses/_components/CourseCard';
import { getCategories } from '@/queries/categories';
import HeroSection from '@/components/HeroSection';

const HomePage = async () => {
    const courses = await getCourseList();
    const categories = await getCategories();
    // console.log(cat);

    return (
        <>
            <HeroSection />
            {/* Courses */}
            <section id="courses" className="container space-y-8 py-12 md:py-16 lg:py-20">
                <div className="flex items-center justify-between">
                    <SectionTitle>دوره‌ها</SectionTitle>
                    <Link
                        href={'/courses'}
                        className="flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary hover:text-primary"
                    >
                        نمایش همه <ArrowLeftIcon className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courses.map((course) => {
                        return <CourseCard key={course.id} course={course} />;
                    })}
                </div>
            </section>

            {/* Categories Section */}
            {/* <section id="categories" className="container space-y-6  py-8  md:py-12 lg:py-24">
                <div className="flex items-center justify-between">
                    <SectionTitle>Categories</SectionTitle>

                    <Link href={''} className=" text-sm font-medium  hover:opacity-80 flex items-center gap-1">
                        Browse All <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mx-auto grid justify-center gap-4 grid-cols-2  md:grid-cols-3 2xl:grid-cols-4">
                    {categories.map((category) => {
                        return (
                            <Link
                                href={`/categories/${category.id}`}
                                key={category.id}
                                className="relative overflow-hidden rounded-lg border bg-background p-2 hover:scale-105 transition-all duration-500 ease-in-out"
                            >
                                <div className="flex  flex-col gap-4 items-center justify-between rounded-md p-6">
                                    <Image
                                        src={`/assets/images/categories/${category.thumbnail}`}
                                        alt={category.title}
                                        width={100}
                                        height={100}
                                    />
                                    <h3 className="font-bold">{category.title}</h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section> */}
        </>
    );
};
export default HomePage;
