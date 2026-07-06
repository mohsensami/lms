import Image from "next/image";
import React from "react";

const MoneyBack = () => {
  return (
    <div className="bg-primary/5 px-4 py-8 md:px-16">
      <div className="flex w-full flex-col items-center gap-8 py-4 md:flex-row">
        <div className="flex justify-center md:w-1/2">
          <Image
            src="/assets/images/money.png"
            alt="ضمانت بازگشت وجه"
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>

        <div className="text-center md:w-1/2 md:text-right">
          <h3 className="mb-2 text-lg font-semibold text-success">
            بدون هیچ ریسکی امتحان کنید
          </h3>
          <h2 className="mb-4 text-3xl font-extrabold text-foreground sm:text-4xl">
            ۳۰ روز ضمانت بازگشت وجه
          </h2>
          <p className="text-muted-foreground">
            اگر ظرف ۳۰ روز اول تشخیص دادید این دوره مناسب شما نیست، می‌توانید هر زمان درخواست بازگشت وجه بدهید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoneyBack;
