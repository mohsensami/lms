import { replaceMongoIdInArray } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';

export async function getApprovedCommentsForPost(postId) {
    if (!postId) return [];
    const comments = await prisma.postComment.findMany({
        where: { postId, status: 'approved' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
    });
    return replaceMongoIdInArray(comments);
}

export async function getApprovedCommentCountForPost(postId) {
    if (!postId) return 0;
    return prisma.postComment.count({ where: { postId, status: 'approved' } });
}

export async function getPostCommentsForUser(userId) {
    if (!userId) return [];
    const comments = await prisma.postComment.findMany({
        where: { userId },
        include: { post: true },
        orderBy: { createdAt: 'desc' },
    });
    return replaceMongoIdInArray(comments);
}

export async function getAllPostComments() {
    const comments = await prisma.postComment.findMany({
        include: { post: true, user: true },
        orderBy: { createdAt: 'desc' },
    });
    return replaceMongoIdInArray(comments);
}

export async function setPostCommentStatus(commentId, status) {
    return prisma.postComment.update({ where: { id: commentId }, data: { status } });
}

export async function deletePostComment(commentId) {
    return prisma.postComment.delete({ where: { id: commentId } });
}
