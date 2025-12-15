import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatCard } from "@/components/dashboard";
import { Button, Card, Icon } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  // Placeholder data - will be fetched from database later
  const stats = {
    totalXp: 0,
    accuracy: 0,
    timeSpent: "0h 0m",
    quizzesCompleted: 0,
  };

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
            Ready to master Data Structures & Algorithms?
          </p>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total XP"
              value={stats.totalXp.toLocaleString()}
              change="+0 XP today"
              changeType="positive"
              icon="military_tech"
            />
            <StatCard
              label="Accuracy"
              value={`${stats.accuracy}%`}
              change="Keep practicing!"
              changeType="neutral"
              icon="target"
            />
            <StatCard
              label="Time Spent"
              value={stats.timeSpent}
              icon="schedule"
            />
            <StatCard
              label="Quizzes"
              value={stats.quizzesCompleted}
              change="Start your first quiz"
              changeType="neutral"
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
                Get Started
              </span>
              <Icon name="rocket_launch" className="text-primary" />
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2">
              <h3 className="text-white text-xl font-bold leading-tight">
                Start Your Learning Journey
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Take a quiz to test your knowledge and earn XP!
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
            ].map((topic) => (
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
                    <p className="text-xs text-text-muted">0 questions</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Activity Section Placeholder */}
          <Card variant="elevated" className="mt-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Study Activity</h3>
              <select className="bg-surface-light border-none text-xs rounded-lg text-text-muted focus:ring-1 focus:ring-primary py-1 px-3">
                <option>Last 7 Days</option>
                <option>Last Month</option>
              </select>
            </div>
            <div className="flex items-center justify-center h-32 text-text-muted">
              <div className="text-center">
                <Icon name="bar_chart" size="xl" className="mb-2 opacity-50" />
                <p className="text-sm">Complete quizzes to see your activity</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Right */}
        <div className="flex flex-col gap-6">
          {/* Daily Challenge */}
          <div className="bg-gradient-to-b from-[#362348] to-surface-dark rounded-xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-primary/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-2 mb-4">
              <Icon name="star" className="text-yellow-400" filled />
              <h3 className="text-lg font-bold text-white">Daily Challenge</h3>
            </div>
            <div className="bg-background/50 backdrop-blur rounded-lg p-4 mb-4 border border-white/5">
              <p className="text-sm font-medium text-white mb-1">Coming Soon!</p>
              <p className="text-xs text-text-muted">
                New challenges will be available once questions are added.
              </p>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              disabled
            >
              No Challenge Available
            </Button>
          </div>

          {/* Recommended Quizzes */}
          <Card variant="elevated" className="overflow-hidden !p-0">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-base font-bold text-white">
                Recommended Quizzes
              </h3>
            </div>
            <div className="p-4">
              <div className="text-center py-6 text-text-muted">
                <Icon name="quiz" size="xl" className="mb-2 opacity-50" />
                <p className="text-sm">No quizzes available yet</p>
                <p className="text-xs mt-1">Check back soon!</p>
              </div>
            </div>
          </Card>

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
