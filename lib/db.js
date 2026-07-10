// Prisma connects lazily/automatically on first query, so there's no
// explicit "connect" step needed anymore (unlike the old Mongoose setup).
// This wrapper is kept as-is so every query file that already calls
// `withDb(async () => {...})` keeps working unchanged.
export async function withDb(operation, fallbackValue = null) {
    try {
        return await operation();
    } catch (error) {
        console.error('DB operation failed:', error);
        if (fallbackValue !== null) {
            return fallbackValue;
        }
        throw error;
    }
}
