// Prisma connects lazily/automatically on first query, so there's no
// explicit "connect" step needed anymore (unlike the old Mongoose setup).
//
// Neon's free/serverless Postgres suspends its compute after a period of
// inactivity ("scale to zero"). The first query that hits it after being
// idle has to wait for the instance to wake up, and that first attempt can
// legitimately time out with Prisma error P1001
// ("Can't reach database server ..."). A short retry almost always
// succeeds on the 2nd try because the DB is awake by then. This is on top
// of (not instead of) reducing how many parallel queries a single page
// fires — see CourseLessonList.jsx for an example of a query that was
// removed entirely because the data was already available.
const RETRYABLE_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);

function isRetryableError(error) {
    if (error?.code && RETRYABLE_PRISMA_CODES.has(error.code)) {
        return true;
    }
    // Fallback for cases where Prisma doesn't attach a structured code.
    return typeof error?.message === 'string' && error.message.includes("Can't reach database server");
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDb(operation, fallbackValue = null, { retries = 2, retryDelayMs = 400 } = {}) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            const isLastAttempt = attempt === retries;
            if (!isRetryableError(error) || isLastAttempt) {
                break;
            }

            console.warn(
                `DB operation failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${retryDelayMs}ms...`,
                error?.message,
            );
            await delay(retryDelayMs * (attempt + 1));
        }
    }

    console.error('DB operation failed:', lastError);
    if (fallbackValue !== null) {
        return fallbackValue;
    }
    throw lastError;
}