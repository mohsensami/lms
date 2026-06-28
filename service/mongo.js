// import mongoose from "mongoose";

// export async function dbConnect() {
//   try {
//     const conn = await mongoose.connect(
//       String(process.env.MONGODB_CONNECTION_STRING),
//     );
//     return conn;
//   } catch (error) {
//     console.log(error);
//   }
// }

import mongoose from 'mongoose';

const globalWithMongoose = globalThis;

if (!globalWithMongoose._mongooseCache) {
    globalWithMongoose._mongooseCache = {
        conn: null,
        promise: null,
    };
}

const mongooseCache = globalWithMongoose._mongooseCache;

export async function dbConnect() {
    if (mongooseCache.conn) {
        return mongooseCache.conn;
    }

    if (!mongooseCache.promise) {
        const uri = String(process.env.MONGODB_CONNECTION_STRING);
        if (!uri) {
            throw new Error('Missing MONGODB_CONNECTION_STRING environment variable');
        }

        mongoose.set('strictQuery', false);
        mongoose.set('bufferCommands', false);

        mongooseCache.promise = mongoose
            .connect(uri, {
                bufferCommands: false,
                bufferTimeoutMS: 30000,
                connectTimeoutMS: 30000,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                family: 4,
            })
            .then((mongooseInstance) => {
                console.log('MongoDB Connected');
                return mongooseInstance;
            })
            .catch((error) => {
                mongooseCache.promise = null;
                throw error;
            });
    }

    mongooseCache.conn = await mongooseCache.promise;
    return mongooseCache.conn;
}
