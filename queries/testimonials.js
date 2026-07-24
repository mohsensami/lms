import { replaceMongoIdInArray, mapScalarRefsInArray } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';

export async function getTestimonialsForCourse(courseId) {
    const testimonials = await prisma.testimonial.findMany({ where: { courseId } });
    const mapped = mapScalarRefsInArray(testimonials, { userId: 'user' });
    return replaceMongoIdInArray(mapped);
}

export async function getTestimonialsForUser(userId) {
    if (!userId) return [];
    const testimonials = await prisma.testimonial.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { createdAt: 'desc' },
    });
    return replaceMongoIdInArray(testimonials);
}

export async function getAllTestimonials() {
    const testimonials = await prisma.testimonial.findMany({
        include: { course: true, user: true },
        orderBy: { createdAt: 'desc' },
    });
    return replaceMongoIdInArray(testimonials);
}

export async function setTestimonialStatus(testimonialId, status) {
    const testimonial = await prisma.testimonial.update({
        where: { id: testimonialId },
        data: { status },
    });
    return testimonial;
}

export async function deleteTestimonial(testimonialId) {
    return prisma.testimonial.delete({ where: { id: testimonialId } });
}
