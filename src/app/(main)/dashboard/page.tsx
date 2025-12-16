import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard, CourseCardWithImage, DailyChallengeWidget, StudyActivityChart } from "@/components/dashboard";
import { Button, Card, Icon } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
};

async function getUserStats(userId: string) {
  // Get user with progress
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
      streak: true,
      progress: {
        select: {
          totalXp: true,
          totalQuizzes: true,
          totalQuestions: true,
          correctAnswers: true,
          topicProgress: true,
        },
      },
    },
  });

  if (!user) return null;

  const accuracy = user.progress?.totalQuestions && user.progress.totalQuestions > 0
    ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
    : 0;

  // Get today's XP
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttempts = await prisma.quizAttempt.aggregate({
    where: {
      userId,
      completedAt: { gte: today },
    },
    _sum: { xpEarned: true },
  });

  // Get recent quiz attempts
  const recentQuizzes = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  return {
    totalXp: user.xp,
    level: user.level,
    streak: user.streak,
    accuracy,
    quizzesCompleted: user.progress?.totalQuizzes || 0,
    todayXp: todayAttempts._sum.xpEarned || 0,
    topicProgress: user.progress?.topicProgress as Record<string, { correct: number; total: number }> || {},
    recentQuizzes,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  // Fetch user stats
  const stats = session?.user?.id
    ? await getUserStats(session.user.id)
    : null;

  // Calculate level progress
  const currentXp = stats?.totalXp || 0;
  const currentLevel = stats?.level || 1;
  const xpForCurrentLevel = Math.pow(currentLevel, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel + 1, 2) * 100;
  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const levelProgress = xpNeededForNextLevel > 0
    ? Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Welcome Text */}
        <div className="flex-1 flex flex-col justify-center gap-2 min-w-[300px]">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-text-muted text-lg">
            {stats && stats.streak > 0
              ? `${stats.streak} day streak! Keep it going!`
              : "Ready to master Data Structures & Algorithms?"}
          </p>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total XP"
              value={(stats?.totalXp || 0).toLocaleString()}
              change={stats?.todayXp ? `+${stats.todayXp} XP today` : "Start earning!"}
              changeType={stats?.todayXp ? "positive" : "neutral"}
              icon="military_tech"
            />
            <StatCard
              label="Accuracy"
              value={`${stats?.accuracy || 0}%`}
              change={stats?.accuracy && stats.accuracy >= 70 ? "Great job!" : "Keep practicing!"}
              changeType={stats?.accuracy && stats.accuracy >= 70 ? "positive" : "neutral"}
              icon="target"
            />
            <StatCard
              label="Level"
              value={stats?.level || 1}
              change={`${levelProgress}% to next`}
              changeType="neutral"
              icon="star"
            />
            <StatCard
              label="Quizzes"
              value={stats?.quizzesCompleted || 0}
              change={stats?.quizzesCompleted ? `${stats.quizzesCompleted} completed` : "Start your first quiz"}
              changeType={stats?.quizzesCompleted ? "positive" : "neutral"}
              icon="quiz"
            />
          </div>
        </div>

        {/* Quick Start Card */}
        <div className="lg:w-[450px] bg-gradient-to-br from-surface-dark to-[#261933] rounded-2xl p-1 border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="h-full bg-surface-dark/50 backdrop-blur-sm rounded-xl p-6 flex flex-col relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                {stats?.quizzesCompleted ? "Continue Learning" : "Get Started"}
              </span>
              <Icon name="rocket_launch" className="text-primary" />
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2">
              <h3 className="text-white text-xl font-bold leading-tight">
                {stats?.quizzesCompleted
                  ? "Ready for Another Challenge?"
                  : "Start Your Learning Journey"}
              </h3>
              <p className="text-text-muted text-sm mb-4">
                {stats?.quizzesCompleted
                  ? "Keep building your skills with more quizzes!"
                  : "Take a quiz to test your knowledge and earn XP!"}
              </p>
              <Link href="/quizzes">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Icon name="play_arrow" size="sm" />
                  Browse Quizzes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Topics to Learn */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Topics to Explore</h3>
            <Link
              href="/courses"
              className="text-primary text-sm font-medium hover:text-primary-light transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Arrays", icon: "data_array", color: "blue" },
              { name: "Strings", icon: "text_fields", color: "green" },
              { name: "Linked Lists", icon: "link", color: "purple" },
              { name: "Stacks & Queues", icon: "layers", color: "orange" },
              { name: "Trees", icon: "account_tree", color: "pink" },
              { name: "Graphs", icon: "hub", color: "cyan" },
            ].map((topic) => {
              const progress = stats?.topicProgress?.[topic.name];
              const mastery = progress?.total
                ? Math.round((progress.correct / progress.total) * 100)
                : 0;

              return (
                <Link
                  key={topic.name}
                  href={`/courses?topic=${encodeURIComponent(topic.name)}`}
                  className="group bg-surface-dark rounded-xl p-5 border border-white/5 hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-12 rounded-xl bg-${topic.color}-500/10 flex items-center justify-center group-hover:bg-${topic.color}-500 transition-colors`}
                    >
                      <Icon
                        name={topic.icon}
                        className={`text-${topic.color}-400 group-hover:text-white transition-colors`}
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold group-hover:text-primary transition-colors">
                        {topic.name}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {progress?.total
                          ? `${mastery}% mastery (${progress.total} questions)`
                          : "Not started"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card variant="elevated" className="mt-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <Link
                href="/profile"
                className="text-primary text-sm font-medium hover:text-primary-light transition-colors"
              >
                View All
              </Link>
            </div>
            {stats?.recentQuizzes && stats.recentQuizzes.length > 0 ? (
              <div className="space-y-3">
                {stats.recentQuizzes.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-light/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        attempt.score >= 70 ? "bg-success/20 text-success" : "bg-error/20 text-error"
                      }`}>
                        <Icon name={attempt.score >= 70 ? "check" : "close"} size="sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{attempt.quiz.title}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(attempt.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        attempt.score >= 70 ? "text-success" : "text-error"
                      }`}>
                        {attempt.score}%
                      </p>
                      <p className="text-xs text-primary">+{attempt.xpEarned} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-text-muted">
                <div className="text-center">
                  <Icon name="bar_chart" size="xl" className="mb-2 opacity-50" />
                  <p className="text-sm">Complete quizzes to see your activity</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Right */}
        <div className="flex flex-col gap-6">
          {/* Streak & Level */}
          {stats && (
            <Card variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Your Progress</h3>
              </div>

              {/* Level Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-muted">Level {currentLevel}</span>
                  <span className="text-primary">{xpNeededForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}</span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-light/50">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Icon name="local_fire_department" className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {stats.streak} Day Streak
                  </p>
                  <p className="text-xs text-text-muted">
                    {stats.streak > 0 ? "Keep it going!" : "Complete a quiz today to start a streak!"}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Daily Challenge */}
          <DailyChallengeWidget challenge={null} />

          {/* Quick Links */}
          <Card variant="elevated">
            <h3 className="text-base font-bold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-light transition-colors group"
              >
                <Icon name="person" className="text-text-muted group-hover:text-primary" />
                <span className="text-sm text-text-muted group-hover:text-white">
                  Your Profile
                </span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-light transition-colors group"
              >
                <Icon name="leaderboard" className="text-text-muted group-hover:text-primary" />
                <span className="text-sm text-text-muted group-hover:text-white">
                  Leaderboard
                </span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-light transition-colors group"
              >
                <Icon name="settings" className="text-text-muted group-hover:text-primary" />
                <span className="text-sm text-text-muted group-hover:text-white">
                  Settings
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
