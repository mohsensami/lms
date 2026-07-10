"use server";


import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/queries/users";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";


export async function updateUserInfo(email, updatedData) {
  try {
    await prisma.user.update({
      where: { email },
      data: updatedData,
    });
    revalidatePath("/account");
  } catch (error) {
    throw new Error(error);
  }
}
// End method

export async function updateProfilePicture(profilePicture) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("شما وارد حساب کاربری خود نشده‌اید.");
  }

  await updateUserInfo(session.user.email, { profilePicture });
}
// End method

export async function changePassword(email, oldPassword, newPassword) {
  const isMatch = await validatePassword(email, oldPassword);

  if (!isMatch) {
    throw new Error("Please enter a valid current password");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 5);

  try {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    revalidatePath("/account");
  } catch (error) {
    throw new Error(error);
  }
}