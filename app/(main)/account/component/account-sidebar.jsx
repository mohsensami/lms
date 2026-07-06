import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import Menu from "./account-menu";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/queries/users";

const AccountSidebar = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const loggedInUser = await getUserByEmail(session?.user?.email);
  // console.log(loggedInUser);

  return (
    <div className="lg:w-1/4 md:px-3">
      <div className="relative">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="profile-pic text-center mb-5">
            <input
              id="pro-img"
              name="profile-image"
              type="file"
              className="hidden"
            />
            <div>
              <div className="relative size-28 mx-auto">
                <Image
                  src={loggedInUser?.profilePicture}
                  className="rounded-full ring-4 ring-primary/10"
                  id="profile-banner"
                  alt={`${loggedInUser?.firstName}`}
                  width={112}
                  height={112}
                />
                <label
                  className="absolute inset-0 cursor-pointer"
                  htmlFor="pro-img"
                />
              </div>
              <div className="mt-4">
                <h5 className="text-lg font-bold text-foreground">
                  {`${loggedInUser?.firstName} ${loggedInUser?.lastName}`}
                </h5>
                <p className="text-muted-foreground">{loggedInUser?.email}</p>
                <p className="mt-1 text-sm font-bold text-primary">
                  نقش: {loggedInUser?.role === 'instructor' ? 'مدرس' : loggedInUser?.role === 'admin' ? 'مدیر' : 'دانشجو'}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <Menu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSidebar;
