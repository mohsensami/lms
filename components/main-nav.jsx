import Link from "next/link";
import React from "react";
import Logo from "./logo";

import { cn } from "@/lib/utils";

import { X } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const MainNav = ({ items, children }) => {
  return (
    <>
      <div className="flex gap-6 lg:gap-10">
        <Link href="/">
          <Logo />
        </Link>
        {items?.length ? (
          <nav className="hidden gap-6 lg:flex">
            {items?.map((item, index) => (
              <Link
                key={index}
                href={item.disable ? "#" : item.href}
                className={cn(
                  "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm ",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      <nav>login</nav>
    </>
  );
};

export default MainNav;
