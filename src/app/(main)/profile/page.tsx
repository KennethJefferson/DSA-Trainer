"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Icon } from "@/components/ui";
import { ProfileSidebar, ProfileTabs, ActivityHeatmap, BadgeGrid, ProfileSettingsForm } from "@/components/profile";
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
    studyTimeMinutes?: number;
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
  const [activeTab, setActiveTab] = useState("overview");

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

  const user = {
    name: stats?.user?.name || session?.user?.name || null,
    email: stats?.user?.email || session?.user?.email || undefined,
    avatar: stats?.user?.avatar || session?.user?.image || null,
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
    studyTimeMinutes: 0,
  };

  // Format study time
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-white text-4xl font-black leading-tight tracking-tight">User Profile</h1>
        <p className="text-text-muted text-base font-normal mt-2">
          Manage your personal information, view achievements, and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <ProfileSidebar
            user={user}
            stats={userStats}
            joinedAt={stats?.user?.joinedAt}
          />
        </div>

        {/* Right Column: Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
          {/* Tab Navigation */}
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === "overview" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Quizzes */}
                <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] bg-primary/5 size-24 rounded-full group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <Icon name="checklist" />
                    <span className="text-sm font-medium">Total Quizzes</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{userStats.totalQuizzes.toLocaleString()}</div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="trending_up" className="text-sm" />
                    +12% this month
                  </div>
                </div>

                {/* Accuracy Rate */}
                <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] bg-blue-500/5 size-24 rounded-full group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <Icon name="percent" />
                    <span className="text-sm font-medium">Accuracy Rate</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{userStats.accuracy}%</div>
                  <div className="text-xs text-text-muted">
                    {userStats.accuracy >= 80 ? "Top 5% of users" : "Keep practicing!"}
                  </div>
                </div>

                {/* Study Time */}
                <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] bg-purple-500/5 size-24 rounded-full group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <Icon name="timer" />
                    <span className="text-sm font-medium">Study Time</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatStudyTime(userStats.studyTimeMinutes || 0)}
                  </div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="trending_up" className="text-sm" />
                    +3h this week
                  </div>
                </div>
              </div>

              {/* Activity Heatmap */}
              <ActivityHeatmap data={stats?.activityData} />

              {/* Badges */}
              <BadgeGrid
                badges={stats?.badges}
                totalQuizzes={userStats.totalQuizzes}
                accuracy={userStats.accuracy}
                streak={userStats.streak}
              />

              {/* Profile Settings Form */}
              <ProfileSettingsForm user={user} />
            </>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-8">
              {/* All Badges */}
              <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                <h3 className="text-white text-lg font-bold mb-6">All Achievements</h3>
                {stats?.badges && stats.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="bg-background rounded-lg p-4 text-center"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="font-medium text-white text-sm">{badge.name}</p>
                        <p className="text-xs text-text-muted mt-1">{badge.description}</p>
                        <p className="text-xs text-primary mt-2">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-muted">
                    <Icon name="workspace_premium" size="xl" className="mb-2 opacity-50" />
                    <p className="text-sm">Complete quizzes to unlock achievements!</p>
                  </div>
                )}
              </div>

              {/* Topic Mastery */}
              {stats?.topicMastery && stats.topicMastery.length > 0 && (
                <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                  <h3 className="text-white text-lg font-bold mb-6">Topic Mastery</h3>
                  <div className="space-y-4">
                    {stats.topicMastery.map((topic) => (
                      <div key={topic.topic}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-white font-medium">{topic.topic}</span>
                          <span className="text-text-muted">
                            {topic.mastery}% ({topic.questionsAnswered} questions)
                          </span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              topic.mastery >= 80 ? "bg-green-500" :
                              topic.mastery >= 60 ? "bg-primary" :
                              topic.mastery >= 40 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${topic.mastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <ProfileSettingsForm user={user} />
          )}

          {activeTab === "billing" && (
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">Billing & Subscription</h3>
              <div className="text-center py-12">
                <Icon name="credit_card" size="xl" className="text-text-muted mb-4 opacity-50" />
                <p className="text-text-muted">You are currently on the free plan.</p>
                <p className="text-sm text-text-muted mt-2">
                  Upgrade to Pro for unlimited quizzes and advanced analytics.
                </p>
                <button className="mt-4 bg-primary hover:bg-primary/80 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
