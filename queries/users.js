import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { User } from '@/model/user-model';
import bcrypt from 'bcryptjs';

export async function getUserByEmail(email) {
    if (!email) {
        return null;
    }
    return withDb(async () => {
        const user = await User.findOne({ email: email }).lean();
        return replaceMongoIdInObject(user);
    });
}

export async function getUserDetails(userId) {
    return withDb(async () => {
        const user = await User.findById(userId).lean();
        return replaceMongoIdInObject(user);
    });
}

export async function validatePassword(email, password) {
    const user = await getUserByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
}
