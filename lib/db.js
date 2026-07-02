import { dbConnect } from '@/service/mongo';

export async function withDb(operation, fallbackValue = null) {
    try {
        await dbConnect();
        return await operation();
    } catch (error) {
        console.error('DB operation failed:', error);
        if (fallbackValue !== null) {
            return fallbackValue;
        }
        throw error;
    }
}
