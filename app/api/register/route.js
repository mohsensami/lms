import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const POST = async (request) => {
  const { firstName, lastName, email, password, userRole } =
    await request.json();

  const hashedPassword = await bcrypt.hash(password, 5);

  const newUser = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: userRole,
  };

  try {
    await prisma.user.create({ data: newUser });
    return new NextResponse("User has been created", {
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(error.message, {
      status: 201,
    });
  }
};
