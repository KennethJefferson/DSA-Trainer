import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  const changeColors = {
    positive: "text-success",
    negative: "text-error",
    neutral: "text-text-muted",
  };

  return (
    <div className="bg-surface-dark p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        <Icon
          name={icon}
          size="sm"
          className="text-primary group-hover:scale-110 transition-transform"
        />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {change && (
        <p className={cn("text-xs font-medium mt-1", changeColors[changeType])}>
          {change}
        </p>
      )}
    </div>
  );
}
