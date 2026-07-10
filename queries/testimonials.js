import { replaceMongoIdInArray, mapScalarRefsInArray } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';

export async function getTestimonialsForCourse(courseId) {
    const testimonials = await prisma.testimonial.findMany({ where: { courseId } });
    const mapped = mapScalarRefsInArray(testimonials, { userId: 'user' });
    return replaceMongoIdInArray(mapped);
}
