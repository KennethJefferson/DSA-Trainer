import { getServerSession } from "next-auth";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent, Icon } from "@/components/ui";
import { StatCard } from "@/components/dashboard";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Placeholder stats
  const stats = {
    totalXp: 0,
    level: 1,
    quizzesCompleted: 0,
    accuracy: 0,
    streak: 0,
    longestStreak: 0,
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Profile Header */}
      <Card variant="elevated" className="mb-8">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          {user?.image ? (
            <Image
              src={user.image}
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
            <h1 className="text-2xl font-bold text-white">{user?.name || "User"}</h1>
            <p className="text-text-muted">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <Icon name="star" size="sm" filled />
                <span className="text-sm font-semibold">Level {stats.level}</span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Icon name="military_tech" size="sm" />
                <span className="text-sm font-semibold">{stats.totalXp} XP</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total XP"
          value={stats.totalXp}
          icon="military_tech"
        />
        <StatCard
          label="Quizzes"
          value={stats.quizzesCompleted}
          icon="quiz"
        />
        <StatCard
          label="Accuracy"
          value={`${stats.accuracy}%`}
          icon="target"
        />
        <StatCard
          label="Streak"
          value={`${stats.streak} days`}
          change={`Best: ${stats.longestStreak} days`}
          icon="bolt"
        />
      </div>

      {/* Achievements */}
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="emoji_events" className="text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted">
            <Icon name="workspace_premium" size="xl" className="mb-2 opacity-50" />
            <p className="text-sm">Complete quizzes to unlock achievements!</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="history" className="text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted">
            <Icon name="timeline" size="xl" className="mb-2 opacity-50" />
            <p className="text-sm">Your quiz history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
