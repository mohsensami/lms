import Link from "next/link";
import React from "react";
import Logo from "./logo";

const MainNav = ({ items, children }) => {
  return (
    <>
      <div className="flex gap-6 lg:gap-10">
        <Link href="/">
          <Logo />
        </Link>
        menu
      </div>
    </>
  );
};

export default MainNav;
