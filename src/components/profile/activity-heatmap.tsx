"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

interface ActivityHeatmapProps {
  data?: Array<{
    date: string;
    quizzes: number;
    xp: number;
  }>;
}

export function ActivityHeatmap({ data = [] }: ActivityHeatmapProps) {
  // Generate 365 days of activity data (or use provided data)
  const heatmapData = useMemo(() => {
    const days: Array<{ date: string; level: number; quizzes: number; xp: number }> = [];
    const today = new Date();
    const dataMap = new Map(data.map(d => [d.date, d]));

    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dataMap.get(dateStr);

      const quizzes = dayData?.quizzes || 0;
      const level = quizzes === 0 ? 0 : quizzes === 1 ? 1 : quizzes <= 3 ? 2 : 3;

      days.push({
        date: dateStr,
        level,
        quizzes: dayData?.quizzes || 0,
        xp: dayData?.xp || 0,
      });
    }

    return days;
  }, [data]);

  // Group days into weeks (columns)
  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7));
    }
    return result;
  }, [heatmapData]);

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-bold">Learning Activity</h3>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="size-3 rounded-sm bg-border-dark" />
            <div className="size-3 rounded-sm bg-primary/40" />
            <div className="size-3 rounded-sm bg-primary/70" />
            <div className="size-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "size-3 rounded-[2px] transition-colors",
                  day.level === 0 && "bg-border-dark",
                  day.level === 1 && "bg-primary/40",
                  day.level === 2 && "bg-primary/70",
                  day.level === 3 && "bg-primary"
                )}
                title={`${day.date}: ${day.quizzes} quizzes, ${day.xp} XP`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
