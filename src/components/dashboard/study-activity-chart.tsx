"use client";

import { useMemo } from "react";

interface StudyActivityChartProps {
  data?: {
    day: string;
    value: number;
  }[];
}

const defaultData = [
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

export function StudyActivityChart({ data = defaultData }: StudyActivityChartProps) {
  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.value));
    return max > 0 ? max : 100;
  }, [data]);

  const hasActivity = data.some(d => d.value > 0);

  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Study Activity</h3>
        <span className="text-xs text-text-muted">This Week</span>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((item, index) => {
          const height = hasActivity ? (item.value / maxValue) * 100 : 0;
          const isToday = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6);

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full h-24 flex items-end justify-center">
                <div
                  className={`w-full max-w-8 rounded-t-lg transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-primary to-purple-400"
                      : height > 0
                      ? "bg-primary/40"
                      : "bg-surface-light"
                  }`}
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
              {/* Label */}
              <span className={`text-xs ${isToday ? "text-primary font-medium" : "text-text-muted"}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {!hasActivity && (
        <p className="text-center text-text-muted text-sm mt-4">
          Complete quizzes to see your activity here
        </p>
      )}
    </div>
  );
}
