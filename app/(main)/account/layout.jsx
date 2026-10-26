import React from "react";
import AccountSidebar from "./component/account-sidebar";

// The dashboard uses the whole screen width: a fixed-width sidebar and a
// content area that takes everything that is left (no centred container).
function Layout({ tabs }) {
  return (
    <section className="relative pb-16">
      <div className="relative mt-6 w-full px-4 lg:px-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <AccountSidebar />
          <div className="mt-6 min-w-0 flex-1 lg:mt-0">{tabs}</div>
        </div>
      </div>
    </section>
  );
}

export default Layout;
