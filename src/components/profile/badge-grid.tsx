"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  gradient: string;
  shadowColor: string;
  iconColor: string;
}

interface BadgeGridProps {
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  totalQuizzes?: number;
  accuracy?: number;
  streak?: number;
}

const defaultBadges: Badge[] = [
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Complete 100 quizzes",
    icon: "emoji_events",
    gradient: "from-yellow-400 to-orange-600",
    shadowColor: "shadow-orange-500/20",
    iconColor: "text-yellow-500",
  },
  {
    id: "speedster",
    name: "Speedster",
    description: "Answer in < 5s",
    icon: "bolt",
    gradient: "from-blue-400 to-indigo-600",
    shadowColor: "shadow-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Login 30 days straight",
    icon: "school",
    gradient: "from-primary to-purple-800",
    shadowColor: "shadow-primary/20",
    iconColor: "text-primary",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "100% on 50 quizzes",
    icon: "workspace_premium",
    gradient: "from-green-400 to-emerald-600",
    shadowColor: "shadow-green-500/20",
    iconColor: "text-green-500",
  },
];

export function BadgeGrid({ badges = [], totalQuizzes = 0, accuracy = 0, streak = 0 }: BadgeGridProps) {
  // Determine which badges are earned
  const earnedBadgeIds = new Set(badges.map(b => b.id));

  // Add logic for earning default badges based on stats
  const isQuizMasterEarned = totalQuizzes >= 100 || earnedBadgeIds.has("quiz-master");
  const isScholarEarned = streak >= 30 || earnedBadgeIds.has("scholar");
  const isPerfectionistEarned = (accuracy >= 100 && totalQuizzes >= 50) || earnedBadgeIds.has("perfectionist");

  const badgeStatus = {
    "quiz-master": isQuizMasterEarned,
    "speedster": earnedBadgeIds.has("speedster"),
    "scholar": isScholarEarned,
    "perfectionist": isPerfectionistEarned,
  };

  return (
    <div>
      <h3 className="text-white text-lg font-bold mb-4">Recent Badges</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {defaultBadges.map((badge) => {
          const isEarned = badgeStatus[badge.id as keyof typeof badgeStatus];

          return (
            <div
              key={badge.id}
              className={cn(
                "bg-surface-dark border border-border-dark rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group",
                isEarned
                  ? "hover:bg-border-dark/50"
                  : "opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              <div className={cn(
                "size-16 rounded-full bg-gradient-to-br p-0.5 shadow-lg group-hover:scale-110 transition-transform",
                badge.gradient,
                badge.shadowColor
              )}>
                <div className="size-full rounded-full bg-surface-dark flex items-center justify-center">
                  <Icon name={badge.icon} className={cn("text-3xl", badge.iconColor)} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{badge.name}</p>
                <p className="text-text-muted text-xs">{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
