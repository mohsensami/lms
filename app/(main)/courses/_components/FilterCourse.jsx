"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const FilterCourse = () => {
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
    <div className="hidden rounded-2xl border border-border bg-card p-5 lg:block lg:h-fit">
      <Accordion defaultValue={["categories", "price"]} type="multiple">
        {/* Categories filter */}
        <AccordionItem value="categories" className="border-border">
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            <span className="font-bold text-foreground">دسته‌بندی</span>
          </AccordionTrigger>

          <AccordionContent className="pt-2">
            <ul className="space-y-3">
              {CATEGORY_OPTIONS.map((option, optionIdx) => (
                <li key={option.value} className="flex items-center gap-3">
                  <Checkbox
                    type="checkbox"
                    id={`category-${optionIdx}`}
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
                    htmlFor={`category-${optionIdx}`}
                    className="cursor-pointer text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        {/* Price filter */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            <span className="font-bold text-foreground">قیمت</span>
          </AccordionTrigger>

          <AccordionContent className="pt-2">
            <ul className="space-y-3">
              {PRICE_OPTIONS.map((option, optionIdx) => (
                <li key={option.value} className="flex items-center gap-3">
                  <Checkbox
                    type="checkbox"
                    id={`price-${optionIdx}`}
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
                    htmlFor={`price-${optionIdx}`}
                    className="cursor-pointer text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterCourse;
