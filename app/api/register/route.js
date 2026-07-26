import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const PHONE_REGEX = /^09\d{9}$/;

export const POST = async (request) => {
  const { firstName, lastName, email, password, phone, userRole } =
    await request.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { message: "لطفاً همه‌ی فیلدهای الزامی را پر کنید." },
      { status: 400 },
    );
  }

  if (!phone || !PHONE_REGEX.test(phone)) {
    return NextResponse.json(
      { message: "شماره تلفن همراه معتبر نیست. شماره را به‌صورت 09xxxxxxxxx وارد کنید." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { message: "این ایمیل قبلاً ثبت‌نام کرده است." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  const newUser = {
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: userRole,
  };

  try {
    await prisma.user.create({ data: newUser });
    return NextResponse.json(
      { message: "حساب کاربری با موفقیت ساخته شد." },
      { status: 201 },
    );
  } catch (error) {
    // NOTE: previously this branch returned `status: 201` even on failure,
    // which made the signup form treat every DB error (like a duplicate
    // email slipping past the check above in a race) as a success and
    // silently redirect to /login. Real failures must use a non-2xx status.
    console.log(error);
    return NextResponse.json(
      { message: "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
};
