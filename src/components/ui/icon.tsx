import { cn } from "@/lib/cn";

export interface IconProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  filled?: boolean;
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function Icon({
  name,
  className,
  size = "md",
  filled = false,
}: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        sizes[size],
        filled && "font-filled",
        className
      )}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
