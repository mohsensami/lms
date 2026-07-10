import { PrismaClient } from '@prisma/client';

// Prisma requires the primary key field in the schema to be called `id`
// (a leading underscore, i.e. `_id`, is not a valid Prisma field name).
// The rest of this project's code — queries, actions, and a lot of
// already-finished UI — was written against Mongoose's `_id`. Rather than
// touching every one of those call sites, we wrap the client with an
// extension that walks every query result and renames the `id` key back
// to `_id`, recursively, including nested `include`d relations and arrays.
function renameIdDeep(value) {
    if (Array.isArray(value)) {
        return value.map(renameIdDeep);
    }

    if (value instanceof Date) {
        return value;
    }

    if (value && typeof value === 'object') {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            const newKey = key === 'id' ? '_id' : key;
            result[newKey] = renameIdDeep(val);
        }
        return result;
    }

    return value;
}

function createPrismaClient() {
    const client = new PrismaClient();

    return client.$extends({
        name: 'mongo-style-_id',
        query: {
            $allModels: {
                async $allOperations({ args, query }) {
                    const result = await query(args);
                    return renameIdDeep(result);
                },
            },
        },
    });
}

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
