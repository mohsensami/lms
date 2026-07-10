import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';
import { updateUserInfo } from '@/app/actions/account';

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
};
