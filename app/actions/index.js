"use server";
import { signIn } from "@/auth";

export async function ceredntialLogin(formData) {
  try {
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return response;
  } catch (error) {
    console.log(error);
    // throw new Error(error);
  }
}
