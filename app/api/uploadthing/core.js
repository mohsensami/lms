import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';
import { updateUserInfo } from '@/app/actions/account';
import { getLoggedInUser } from '@/lib/loggedin-user';

const f = createUploadthing();

export const ourFileRouter = {
    avatarUploader: f({
        image: { maxFileSize: '2MB', maxFileCount: 1 },
    })
        .middleware(async () => {
            const session = await auth();

            if (!session?.user?.email) {
                throw new UploadThingError('شما وارد حساب کاربری خود نشده‌اید.');
            }

            // Whatever is returned here is available in onUploadComplete as `metadata`.
            return { email: session.user.email };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            await updateUserInfo(metadata.email, { profilePicture: file.ufsUrl ?? file.url });

            return { profilePicture: file.ufsUrl ?? file.url };
        }),

    // Only admins can upload a post's cover image.
    postImageUploader: f({
        image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
        .middleware(async () => {
            const loggedinUser = await getLoggedInUser();

            if (!loggedinUser) {
                throw new UploadThingError('شما وارد حساب کاربری خود نشده‌اید.');
            }

            if (loggedinUser.role !== 'admin') {
                throw new UploadThingError('فقط مدیران می‌توانند تصویر مقاله آپلود کنند.');
            }

            return { userId: loggedinUser.id };
        })
        .onUploadComplete(async ({ file }) => {
            return { thumbnail: file.ufsUrl ?? file.url };
        }),

    // Instructors/admins attach a downloadable file (practice files, PDFs,
    // zip archives, etc.) to a lesson. `blob` accepts any file type.
    lessonAttachmentUploader: f({
        blob: { maxFileSize: '32MB', maxFileCount: 1 },
    })
        .middleware(async () => {
            const loggedinUser = await getLoggedInUser();

            if (!loggedinUser) {
                throw new UploadThingError('شما وارد حساب کاربری خود نشده‌اید.');
            }

            if (loggedinUser.role !== 'admin' && loggedinUser.role !== 'instructor') {
                throw new UploadThingError('فقط مدرس یا مدیر می‌تواند فایل ضمیمه آپلود کند.');
            }

            return { userId: loggedinUser.id };
        })
        .onUploadComplete(async ({ file }) => {
            return { url: file.ufsUrl ?? file.url, name: file.name };
        }),
};
