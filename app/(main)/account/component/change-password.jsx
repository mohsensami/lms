"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/actions/account";
import { toast } from "sonner";

const ChangePassword = ({ email }) => {
  const [passwordState, setPasswordState] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleChange = (event) => {
    const key = event.target.name;
    const value = event.target.value;
    setPasswordState({
      ...passwordState,
      [key]: value,
    });
  };

  async function doPasswordChange(event) {
    event.preventDefault();

    try {
      await changePassword(
        email,
        passwordState?.oldPassword,
        passwordState?.newPassword,
      );
      toast.success("رمز عبور با موفقیت تغییر کرد");
    } catch (error) {
      toast.error(`خطا: ${error.message}`);
    }
  }

  return (
    <div>
      <h5 className="mb-4 text-lg font-bold text-foreground">تغییر رمز عبور</h5>
      <form onSubmit={doPasswordChange}>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <Label className="mb-2 block">رمز عبور فعلی</Label>
            <Input
              type="password"
              id="oldPassword"
              name="oldPassword"
              onChange={handleChange}
              placeholder="رمز عبور فعلی"
              required=""
            />
          </div>
          <div>
            <Label className="mb-2 block">رمز عبور جدید</Label>
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              onChange={handleChange}
              placeholder="رمز عبور جدید"
              required=""
            />
          </div>
          <div>
            <Label className="mb-2 block">تکرار رمز عبور جدید</Label>
            <Input
              type="password"
              placeholder="تکرار رمز عبور جدید"
              required=""
            />
          </div>
        </div>
        <Button className="mt-5 rounded-xl font-semibold" type="submit">
          ذخیره رمز عبور
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
