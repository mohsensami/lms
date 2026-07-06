"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PRICE_OPTIONS = [
  { label: "رایگان", value: "free" },
  { label: "پولی", value: "paid" },
];

const CATEGORY_OPTIONS = [
  { id: 1, label: "طراحی", value: "design" },
  { id: 3, label: "برنامه‌نویسی", value: "development" },
  { id: 4, label: "بازاریابی", value: "marketing" },
  { id: 5, label: "آی‌تی و نرم‌افزار", value: "it-software" },
  { id: 6, label: "توسعه فردی", value: "personal-development" },
  { id: 7, label: "کسب‌وکار", value: "business" },
  { id: 8, label: "عکاسی", value: "photography" },
  { id: 9, label: "موسیقی", value: "music" },
];

const FilterCourseMobile = () => {
  const [filter, setFilter] = useState({
    categories: ["development"],
    price: ["free"],
    sort: "",
  });

  const applyArrayFilter = ({ type, value }) => {
    const isFilterApplied = filter[type].includes(value);

    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [type]: prev[type].filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [type]: [...prev[type], value],
      }));
    }
  };

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-primary hover:text-primary">
          <Filter className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="text-right">فیلتر دوره‌ها</SheetTitle>
            <Accordion defaultValue={["categories"]} type="multiple">
              {/* Categories filter */}
              <AccordionItem value="categories">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-bold text-foreground">دسته‌بندی</span>
                </AccordionTrigger>

                <AccordionContent className="pt-4 animate-none">
                  <ul className="space-y-4">
                    {CATEGORY_OPTIONS.map((option, optionIdx) => (
                      <li key={option.value} className="flex items-center gap-3">
                        <Checkbox
                          type="checkbox"
                          id={`category-mobile-${optionIdx}`}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          onCheckedChange={() => {
                            applyArrayFilter({
                              type: "categories",
                              value: option.value,
                            });
                          }}
                          checked={filter.categories.includes(option.value)}
                        />
                        <label
                          htmlFor={`category-mobile-${optionIdx}`}
                          className="cursor-pointer text-sm text-muted-foreground"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              {/* Price filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="font-bold text-foreground">قیمت</span>
                </AccordionTrigger>

                <AccordionContent className="pt-4 animate-none">
                  <ul className="space-y-4">
                    {PRICE_OPTIONS.map((option, optionIdx) => (
                      <li key={option.value} className="flex items-center gap-3">
                        <Checkbox
                          type="checkbox"
                          id={`price-mobile-${optionIdx}`}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          onCheckedChange={() => {
                            applyArrayFilter({
                              type: "price",
                              value: option.value,
                            });
                          }}
                          checked={filter.price.includes(option.value)}
                        />
                        <label
                          htmlFor={`price-mobile-${optionIdx}`}
                          className="cursor-pointer text-sm text-muted-foreground"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FilterCourseMobile;
