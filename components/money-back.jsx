import Image from "next/image";
import React from "react";
import { getSiteSettings } from "@/lib/site-settings";

// Texts (and an on/off switch) come from Settings -> money-back guarantee.
const MoneyBack = async () => {
  const { guarantee } = await getSiteSettings();
  if (!guarantee.enabled) return null;

  return (
    <div className="bg-primary/5 px-4 py-8 md:px-16">
      <div className="flex w-full flex-col items-center gap-8 py-4 md:flex-row">
        <div className="flex justify-center md:w-1/2">
          <Image
            src="/assets/images/money.png"
            alt={guarantee.title}
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>

        <div className="text-center md:w-1/2 md:text-right">
          {guarantee.headline && (
            <h3 className="mb-2 text-lg font-semibold text-success">{guarantee.headline}</h3>
          )}
          <h2 className="mb-4 text-3xl font-extrabold text-foreground sm:text-4xl">
            {guarantee.title}
          </h2>
          <p className="text-muted-foreground">{guarantee.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MoneyBack;
