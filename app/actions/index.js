'use server';
import { signIn } from '@/auth';

export async function ceredntialLogin(formData) {
    try {
        const response = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        });
        return response;
    } catch (error) {
        console.log(error);
        return { error: error?.message || 'Login failed. Please try again.' };
    }
}
