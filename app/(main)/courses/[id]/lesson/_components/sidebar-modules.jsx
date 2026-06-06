import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PlayCircle } from "lucide-react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { SidebarLessons } from "./sidebar-lessons";

export const SidebarModules = ({ courseId, modules }) => {
  return (
    <Accordion
      defaultValue="item-1"
      type="single"
      collapsible
      className="w-full px-6"
    >
      {/* item */}
      <AccordionItem className="border-0" value="item-1">
        <AccordionTrigger>Introduction </AccordionTrigger>

        <SidebarLessons />
      </AccordionItem>
      {/* item ends */}
    </Accordion>
  );
};
