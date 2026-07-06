"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ActiveFilters = ({ filter }) => {
  if (!filter.categories.length && !filter.price.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filter.categories.length > 0 &&
        filter.categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className="h-8 gap-1.5 rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20"
            onClick={() =>
              applyArrayFilter({ type: "categories", value: category })
            }
          >
            {category}
            <X className="h-3 w-3" />
          </Button>
        ))}
      {filter.price.length > 0 &&
        filter.price.map((price) => (
          <Button
            key={price}
            variant="ghost"
            className="h-8 gap-1.5 rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20"
            onClick={() => applyArrayFilter({ type: "price", value: price })}
          >
            {price}
            <X className="h-3 w-3" />
          </Button>
        ))}
    </div>
  );
};

export default ActiveFilters;
