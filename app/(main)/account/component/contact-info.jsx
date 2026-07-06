import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ContactInfo = () => {
  return (
    <div>
      <h5 className="mb-4 text-lg font-bold text-foreground">اطلاعات تماس</h5>
      <form>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <Label className="mb-2 block">شماره تماس</Label>
            <Input
              name="number"
              id="number"
              type="number"
              placeholder="شماره تماس"
            />
          </div>
          <div>
            <Label className="mb-2 block">وب‌سایت</Label>
            <Input name="url" id="url" type="url" placeholder="آدرس وب‌سایت" />
          </div>
        </div>
        <Button className="mt-5 rounded-xl font-semibold" type="submit">
          افزودن
        </Button>
      </form>
    </div>
  );
};

export default ContactInfo;
