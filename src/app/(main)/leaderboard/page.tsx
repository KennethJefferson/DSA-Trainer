"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Card, Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  streak: number;
  quizzesTaken: number;
  questionsAnswered: number;
  accuracy: number;
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentUserRank: number | null;
  timeframe: string;
  type: string;
}

type TimeFrame = "all" | "week" | "month";
type LeaderboardType = "xp" | "quizzes" | "accuracy" | "streak";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>("all");
  const [type, setType] = useState<LeaderboardType>("xp");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/leaderboard?timeframe=${timeframe}&type=${type}&page=${page}&limit=20`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeframe, type, page]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-300";
      case 3:
        return "text-amber-600";
      default:
        return "text-text-muted";
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50";
      default:
        return "";
    }
  };

  const getTypeIcon = (t: LeaderboardType) => {
    switch (t) {
      case "xp":
        return "bolt";
      case "quizzes":
        return "quiz";
      case "accuracy":
        return "target";
      case "streak":
        return "local_fire_department";
    }
  };

  const getTypeLabel = (t: LeaderboardType) => {
    switch (t) {
      case "xp":
        return "XP";
      case "quizzes":
        return "Quizzes";
      case "accuracy":
        return "Accuracy";
      case "streak":
        return "Streak";
    }
  };

  const getValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case "xp":
        return `${entry.xp.toLocaleString()} XP`;
      case "quizzes":
        return `${entry.quizzesTaken} quizzes`;
      case "accuracy":
        return `${entry.accuracy}%`;
      case "streak":
        return `${entry.streak} days`;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-text-muted mt-1">
            See how you rank against other learners
          </p>
        </div>

        {/* Current User Rank Card */}
        {session && data?.currentUserRank && (
          <Card variant="elevated" className="!p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon name="person" className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Your Rank</p>
              <p className="text-2xl font-bold text-white">
                #{data.currentUserRank}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Timeframe */}
        <div className="flex rounded-lg bg-surface border border-surface-border overflow-hidden">
          {(["all", "month", "week"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                timeframe === tf
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-white"
              )}
            >
              {tf === "all" ? "All Time" : tf === "month" ? "This Month" : "This Week"}
            </button>
          ))}
        </div>

        {/* Type */}
        <div className="flex rounded-lg bg-surface border border-surface-border overflow-hidden">
          {(["xp", "quizzes", "accuracy", "streak"] as LeaderboardType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors",
                type === t
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-white"
              )}
            >
              <Icon name={getTypeIcon(t)} size="sm" />
              {getTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card variant="elevated" className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !data?.leaderboard.length ? (
          <div className="text-center py-16">
            <Icon name="trophy" size="xl" className="text-text-muted mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-white mb-2">No Rankings Yet</h2>
            <p className="text-text-muted">
              Complete quizzes to earn XP and appear on the leaderboard!
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-light border-b border-surface-border text-xs font-medium text-text-muted uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">User</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-center">{getTypeLabel(type)}</div>
              <div className="col-span-2 text-right">Quizzes</div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-surface-border">
              {data.leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-surface-light/50",
                    entry.isCurrentUser && "bg-primary/5 border-l-2 border-l-primary",
                    getRankBg(entry.rank)
                  )}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        getRankColor(entry.rank)
                      )}
                    >
                      {entry.rank <= 3 ? (
                        <Icon
                          name={entry.rank === 1 ? "emoji_events" : "military_tech"}
                          className={getRankColor(entry.rank)}
                        />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </span>
                  </div>

                  {/* User */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-light flex-shrink-0">
                      {entry.avatar ? (
                        <Image
                          src={entry.avatar}
                          alt={entry.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <Icon name="person" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted">
                        {entry.xp.toLocaleString()} XP total
                      </p>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-sm font-medium">
                      <Icon name="star" size="sm" />
                      {entry.level}
                    </span>
                  </div>

                  {/* Type Value */}
                  <div className="col-span-2 text-center">
                    <span className="text-lg font-bold text-white">
                      {getValue(entry)}
                    </span>
                  </div>

                  {/* Quizzes & Streak */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className="text-sm">
                        <span className="text-white font-medium">{entry.quizzesTaken}</span>
                        <span className="text-text-muted ml-1">quizzes</span>
                      </div>
                      {entry.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-400">
                          <Icon name="local_fire_department" size="sm" />
                          <span className="font-medium">{entry.streak}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
                <p className="text-sm text-text-muted">
                  Showing {(page - 1) * 20 + 1}-
                  {Math.min(page * 20, data.pagination.total)} of{" "}
                  {data.pagination.total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <Icon name="chevron_left" size="sm" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                  >
                    Next
                    <Icon name="chevron_right" size="sm" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
