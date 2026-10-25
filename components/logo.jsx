import Image from "next/image";
import React from "react";
import defaultLogo from "@/assets/easylogo.png";
import { cn } from "@/lib/utils";

// Shows the logo the admin uploaded in Settings, or the bundled one. It only
// receives plain props so it works in both server and client components
// (the header is a client component and gets these from the layout).
const Logo = ({ className = "", logoUrl = "", siteName = "" }) => {
  const alt = siteName ? `لوگوی ${siteName}` : "لوگو";

  return (
    <div>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={cn("max-w-[200px] h-auto", className)} src={logoUrl} alt={alt} />
      ) : (
        <Image className={cn("max-w-[200px]", className)} src={defaultLogo} alt={alt} />
      )}
    </div>
  );
};

export default Logo;
