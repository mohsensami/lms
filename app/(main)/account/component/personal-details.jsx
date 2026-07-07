"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserInfo } from "@/app/actions/account";
import { toast } from "sonner";

const PersonalDetails = ({ userInfo }) => {
  const [infoState, setInfoState] = useState({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    email: userInfo.email,
    designation: userInfo.designation,
    bio: userInfo.bio,
  });

  const handleChange = (event) => {
    const field = event.target.name;
    const value = event.target.value;
    setInfoState({
      ...infoState,
      [field]: value,
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      await updateUserInfo(userInfo?.email, infoState);
      toast.success("اطلاعات کاربر با موفقیت بروزرسانی شد");
    } catch (error) {
      toast.error(`خطا: ${error.message}`);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h5 className="mb-4 text-lg font-bold text-foreground">اطلاعات شخصی</h5>
      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <Label className="mb-2 block">
              نام <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="نام"
              id="firstName"
              name="firstName"
              value={infoState?.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">
              نام خانوادگی <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="نام خانوادگی"
              id="lastName"
              name="lastName"
              value={infoState?.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="mb-2 block">
              ایمیل شما <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              placeholder="ایمیل"
              id="email"
              name="email"
              value={infoState?.email}
              disabled
            />
          </div>
          <div>
            <Label className="mb-2 block">شغل</Label>
            <Input
              id="designation"
              name="designation"
              value={infoState?.designation}
              type="text"
              onChange={handleChange}
              placeholder="شغل"
            />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <div className="mt-5">
            <Label className="mb-2 block">توضیحات</Label>
            <Textarea
              id="bio"
              name="bio"
              value={infoState?.bio}
              onChange={handleChange}
              placeholder="درباره خودتون بنویسید..."
            />
          </div>
        </div>
        <Button className="mt-5 rounded-xl font-semibold" asChild>
          <input type="submit" name="send" value="ذخیره تغییرات" />
        </Button>
      </form>
    </div>
  );
};

export default PersonalDetails;
