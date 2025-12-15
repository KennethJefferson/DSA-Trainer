"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Icon, Button } from "@/components/ui";
import { StatCard } from "@/components/dashboard";
import { cn } from "@/lib/cn";

interface UserStats {
  user: {
    id: string;
    name: string | null;
    email?: string;
    avatar: string | null;
    joinedAt: string;
    lastActiveAt: string | null;
  };
  stats: {
    xp: number;
    level: number;
    levelProgress: number;
    xpToNextLevel: number;
    streak: number;
    rank: number;
    totalQuizzes: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  recentQuizzes: Array<{
    id: string;
    quizId: string;
    quizTitle: string;
    difficulty: string;
    score: number;
    xpEarned: number;
    completedAt: string;
    passed: boolean;
  }>;
  activityData: Array<{
    date: string;
    quizzes: number;
    xp: number;
  }>;
  topicMastery: Array<{
    topic: string;
    mastery: number;
    questionsAnswered: number;
  }>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const response = await fetch("/api/users/me/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = stats?.user || {
    name: session?.user?.name,
    email: session?.user?.email,
    avatar: session?.user?.image,
  };

  const userStats = stats?.stats || {
    xp: 0,
    level: 1,
    levelProgress: 0,
    xpToNextLevel: 100,
    streak: 0,
    rank: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Profile Header */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "User"}
              width={96}
              height={96}
              className="rounded-full border-4 border-primary shadow-glow"
            />
          ) : (
            <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary shadow-glow">
              <Icon name="person" size="xl" className="text-primary" />
            </div>
          )}

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">{user.name || "User"}</h1>
            <p className="text-text-muted">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <Icon name="star" size="sm" filled />
                <span className="text-sm font-semibold">Level {userStats.level}</span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Icon name="military_tech" size="sm" />
                <span className="text-sm font-semibold">{userStats.xp.toLocaleString()} XP</span>
              </div>
              {userStats.rank > 0 && (
                <div className="flex items-center gap-1 text-text-muted">
                  <Icon name="leaderboard" size="sm" />
                  <span className="text-sm font-semibold">Rank #{userStats.rank}</span>
                </div>
              )}
            </div>

            {/* Level Progress */}
            <div className="mt-4 max-w-xs mx-auto sm:mx-0">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                <span>Level {userStats.level}</span>
                <span>{userStats.xpToNextLevel} XP to Level {userStats.level + 1}</span>
              </div>
              <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${userStats.levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Icon name="edit" size="sm" className="mr-1" />
              Edit Profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total XP"
          value={userStats.xp.toLocaleString()}
          icon="military_tech"
        />
        <StatCard
          label="Quizzes"
          value={userStats.totalQuizzes}
          icon="quiz"
        />
        <StatCard
          label="Accuracy"
          value={`${userStats.accuracy}%`}
          changeType={userStats.accuracy >= 70 ? "positive" : "neutral"}
          icon="target"
        />
        <StatCard
          label="Streak"
          value={`${userStats.streak} days`}
          icon="local_fire_department"
        />
      </div>

      {/* Topic Mastery */}
      {stats?.topicMastery && stats.topicMastery.length > 0 && (
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="school" className="text-primary" />
              Topic Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topicMastery.slice(0, 6).map((topic) => (
                <div key={topic.topic}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white font-medium">{topic.topic}</span>
                    <span className="text-text-muted">
                      {topic.mastery}% ({topic.questionsAnswered} questions)
                    </span>
                  </div>
                  <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        topic.mastery >= 80 ? "bg-success" :
                        topic.mastery >= 60 ? "bg-primary" :
                        topic.mastery >= 40 ? "bg-warning" : "bg-error"
                      )}
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Heatmap */}
      {stats?.activityData && stats.activityData.length > 0 && (
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="calendar_month" className="text-primary" />
              Activity (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {stats.activityData.map((day) => {
                const intensity = day.quizzes === 0 ? 0 :
                  day.quizzes === 1 ? 1 :
                  day.quizzes <= 3 ? 2 : 3;

                return (
                  <div
                    key={day.date}
                    className={cn(
                      "w-4 h-4 rounded-sm",
                      intensity === 0 && "bg-surface-light",
                      intensity === 1 && "bg-primary/30",
                      intensity === 2 && "bg-primary/60",
                      intensity === 3 && "bg-primary"
                    )}
                    title={`${day.date}: ${day.quizzes} quizzes, ${day.xp} XP`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 mt-2 text-xs text-text-muted">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-surface-light" />
              <div className="w-3 h-3 rounded-sm bg-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="emoji_events" className="text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.badges && stats.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 rounded-lg bg-surface-light/50 text-center"
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="font-medium text-white text-sm">{badge.name}</p>
                  <p className="text-xs text-text-muted">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <Icon name="workspace_premium" size="xl" className="mb-2 opacity-50" />
              <p className="text-sm">Complete quizzes to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="history" className="text-primary" />
            Recent Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentQuizzes && stats.recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-light/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        quiz.passed
                          ? "bg-success/20 text-success"
                          : "bg-error/20 text-error"
                      )}
                    >
                      <Icon name={quiz.passed ? "check" : "close"} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{quiz.quizTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className={cn(
                          quiz.difficulty === "beginner" && "text-green-400",
                          quiz.difficulty === "easy" && "text-blue-400",
                          quiz.difficulty === "medium" && "text-yellow-400",
                          quiz.difficulty === "hard" && "text-orange-400",
                          quiz.difficulty === "expert" && "text-red-400"
                        )}>
                          {quiz.difficulty}
                        </span>
                        <span>•</span>
                        <span>{new Date(quiz.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-lg font-bold",
                        quiz.passed ? "text-success" : "text-error"
                      )}
                    >
                      {quiz.score}%
                    </p>
                    <p className="text-xs text-primary">+{quiz.xpEarned} XP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <Icon name="timeline" size="xl" className="mb-2 opacity-50" />
              <p className="text-sm">Your quiz history will appear here</p>
              <Link href="/quizzes">
                <Button variant="outline" size="sm" className="mt-4">
                  Start a Quiz
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
