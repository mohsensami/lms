"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchCourse = () => {
  return (
    <div className="relative h-11 max-lg:w-full lg:w-80">
      <Search className="absolute right-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="جستجوی دوره..."
        className="h-11 rounded-full border-border pr-10 text-sm focus-visible:ring-primary"
      />
    </div>
  );
};

export default SearchCourse;
