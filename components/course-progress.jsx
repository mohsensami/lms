import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

const colorByVariant = {
  default: "text-primary",
  success: "text-emerald-700",
};

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};

export const CourseProgress = ({ value, variant, size }) => {
  return (
    <div>
      <Progress
        value={value}
        variant={variant}
        className={cn("h-2", !variant && "text-primary")}
      />
      <p
        className={cn(
          "font-medium mt-2 text-primary",
          colorByVariant[variant || "default"],
          sizeByVariant[size || "default"],
        )}
      >
        {Math.round(value)}% Complete
      </p>
    </div>
  );
};
