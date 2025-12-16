"use client";

import Image from "next/image";
import { Icon } from "@/components/ui";

interface ProfileSidebarProps {
  user: {
    name: string | null;
    email?: string;
    avatar: string | null;
    username?: string;
  };
  stats: {
    xp: number;
    level: number;
    levelProgress: number;
    xpToNextLevel: number;
    streak: number;
    rank: number;
    totalQuizzes: number;
  };
  joinedAt?: string;
}

export function ProfileSidebar({ user, stats, joinedAt }: ProfileSidebarProps) {
  const username = user.username || user.email?.split("@")[0] || "user";
  const xpProgress = stats.xpToNextLevel > 0
    ? Math.min(100, Math.round(((stats.xp % (stats.xpToNextLevel)) / stats.xpToNextLevel) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
        {/* Gradient Header */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent" />

        {/* Avatar with Edit Button */}
        <div className="relative mb-4 group cursor-pointer">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "User"}
              width={128}
              height={128}
              className="rounded-full ring-4 ring-primary/20 transition-all group-hover:ring-primary/40 object-cover"
            />
          ) : (
            <div className="size-32 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/20 transition-all group-hover:ring-primary/40">
              <Icon name="person" size="xl" className="text-primary text-5xl" />
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-surface-dark flex items-center justify-center">
            <Icon name="edit" className="text-sm" />
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            {user.name || "User"}
            {stats.totalQuizzes >= 50 && (
              <span title="Verified Scholar">
                <Icon name="verified" className="text-primary text-xl" />
              </span>
            )}
          </h2>
          <p className="text-text-muted text-sm mt-1">@{username}</p>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            Level {stats.level} Scholar
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white text-sm font-medium">XP to Level {stats.level + 1}</span>
            <span className="text-text-muted text-xs">{stats.xp % stats.xpToNextLevel}/{stats.xpToNextLevel} XP</span>
          </div>
          <div className="w-full bg-background rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="grid grid-cols-2 w-full gap-4 mb-6 border-t border-b border-border-dark py-4">
          <div className="text-center border-r border-border-dark">
            <div className="text-xl font-bold text-white">{stats.totalQuizzes}</div>
            <div className="text-xs text-text-muted">Quizzes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {stats.rank > 0 ? `#${stats.rank}` : "-"}
            </div>
            <div className="text-xs text-text-muted">Global Rank</div>
          </div>
        </div>

        {/* Social Links */}
        <div className="w-full grid grid-cols-3 gap-3">
          <button
            className="flex items-center justify-center p-2.5 rounded-lg bg-background hover:bg-border-dark transition-colors border border-border-dark group"
            title="GitHub"
          >
            <Icon name="code" className="text-text-muted group-hover:text-white" />
          </button>
          <button
            className="flex items-center justify-center p-2.5 rounded-lg bg-background hover:bg-border-dark transition-colors border border-border-dark group"
            title="Twitter"
          >
            <Icon name="flutter_dash" className="text-text-muted group-hover:text-white" />
          </button>
          <button
            className="flex items-center justify-center p-2.5 rounded-lg bg-background hover:bg-border-dark transition-colors border border-border-dark group"
            title="LinkedIn"
          >
            <Icon name="business_center" className="text-text-muted group-hover:text-white" />
          </button>
        </div>

        {/* Member Since */}
        {joinedAt && (
          <p className="mt-6 text-xs text-text-muted">
            Member since {new Date(joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Learning Streak Card */}
      <div className="bg-gradient-to-br from-orange-900/40 to-surface-dark border border-orange-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="text-orange-400 text-sm font-bold uppercase tracking-wider mb-1">Current Streak</div>
          <div className="text-3xl font-black text-white">{stats.streak} Days</div>
          <div className="text-text-muted text-xs mt-1">
            {stats.streak > 0 ? "Keep it up! Don't break the chain." : "Complete a quiz to start your streak!"}
          </div>
        </div>
        <div className="size-12 bg-orange-500/20 rounded-full flex items-center justify-center">
          <Icon name="local_fire_department" className="text-orange-500 text-3xl" />
        </div>
      </div>
    </div>
  );
}
