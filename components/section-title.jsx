import { cn } from "@/lib/utils";

export const SectionTitle = ({ children, className }) => {
  return (
    <div className={cn("relative mb-2 flex items-center gap-3", className)}>
      <span className="h-6 w-1.5 flex-none rounded-full bg-primary" />
      <h2 className="text-xl font-extrabold text-foreground md:text-2xl">
        {children}
      </h2>
    </div>
  );
};
