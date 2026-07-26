'use server';
import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// NextAuth v5 normalizes every error thrown inside a Credentials provider's
// authorize() into a generic "CredentialsSignin" error before it reaches the
// client — the specific message we throw there (wrong password, inactive
// account, etc.) never actually makes it back. So instead of relying on
// that, we validate everything ourselves first and return a precise Persian
// message directly; signIn() is only called once we already know it should
// succeed.
export async function ceredntialLogin(formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return { error: 'لطفاً ایمیل و رمز عبور را وارد کنید.' };
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { error: 'کاربری با این ایمیل یافت نشد.' };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { error: 'رمز عبور اشتباه است.' };
        }

        if (user.isActive === false) {
            return { error: 'این حساب کاربری غیرفعال شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.' };
        }

        const response = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        return response;
    } catch (error) {
        console.log(error);
        return { error: 'ورود ناموفق بود. لطفاً دوباره تلاش کنید.' };
    }
}
