import { requireCreator } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin";
import { Card, CardContent, Icon } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard",
};

async function getAdminStats() {
  const [
    totalQuestions,
    totalQuizzes,
    totalUsers,
    totalAttempts,
    recentQuestions,
    questionsByType,
  ] = await Promise.all([
    prisma.question.count(),
    prisma.quiz.count(),
    prisma.user.count(),
    prisma.quizAttempt.count(),
    prisma.question.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        difficulty: true,
        createdAt: true,
      },
    }),
    prisma.question.groupBy({
      by: ["type"],
      _count: { type: true },
    }),
  ]);

  return {
    totalQuestions,
    totalQuizzes,
    totalUsers,
    totalAttempts,
    recentQuestions,
    questionsByType,
  };
}

export default async function AdminDashboardPage() {
  await requireCreator();
  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Total Questions",
      value: stats.totalQuestions,
      icon: "help",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      href: "/admin/questions",
    },
    {
      label: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: "quiz",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      href: "/admin/quizzes",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "group",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      href: "/admin/users",
    },
    {
      label: "Quiz Attempts",
      value: stats.totalAttempts,
      icon: "assignment_turned_in",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      href: null,
    },
  ];

  const typeLabels: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    multi_select: "Multi Select",
    fill_blank: "Fill in Blank",
    drag_order: "Drag Order",
    drag_match: "Drag Match",
    drag_code_blocks: "Code Blocks",
    code_writing: "Code Writing",
    debugging: "Debugging",
    true_false: "True/False",
    parsons: "Parsons",
  };

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Admin Dashboard"
        description="Manage questions, quizzes, and users"
      />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              variant="elevated"
              className="hover:border-white/10 transition-colors"
            >
              <CardContent className="p-6">
                {stat.href ? (
                  <Link href={stat.href} className="block">
                    <StatCardContent {...stat} />
                  </Link>
                ) : (
                  <StatCardContent {...stat} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Questions */}
          <Card variant="elevated">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Recent Questions</h2>
                <Link
                  href="/admin/questions"
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  View all
                </Link>
              </div>
            </div>
            <CardContent className="p-0">
              {stats.recentQuestions.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon name="help_outline" size="xl" className="text-text-muted mb-2 opacity-50" />
                  <p className="text-text-muted">No questions yet</p>
                  <Link
                    href="/admin/questions/create"
                    className="text-primary hover:text-primary-hover text-sm mt-2 inline-block"
                  >
                    Create your first question
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {stats.recentQuestions.map((question) => (
                    <li key={question.id}>
                      <Link
                        href={`/admin/questions/${question.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="size-10 rounded-lg bg-surface flex items-center justify-center">
                          <Icon name="help" className="text-text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {question.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {typeLabels[question.type] || question.type} •{" "}
                            <span className="capitalize">{question.difficulty}</span>
                          </p>
                        </div>
                        <Icon name="chevron_right" className="text-text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Questions by Type */}
          <Card variant="elevated">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Questions by Type</h2>
            </div>
            <CardContent className="p-6">
              {stats.questionsByType.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="pie_chart" size="xl" className="text-text-muted mb-2 opacity-50" />
                  <p className="text-text-muted">No data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.questionsByType.map((item) => {
                    const percentage = stats.totalQuestions > 0
                      ? Math.round((item._count.type / stats.totalQuestions) * 100)
                      : 0;
                    return (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-muted">
                            {typeLabels[item.type] || item.type}
                          </span>
                          <span className="text-sm font-medium text-white">
                            {item._count.type} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/questions/create">
              <Card
                variant="elevated"
                className="p-6 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon name="add" className="text-primary" size="lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Create Question</h3>
                    <p className="text-sm text-text-muted">Add a new question</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/quizzes/create">
              <Card
                variant="elevated"
                className="p-6 hover:border-green-500/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <Icon name="playlist_add" className="text-green-400" size="lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Create Quiz</h3>
                    <p className="text-sm text-text-muted">Build a new quiz</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/questions?action=import">
              <Card
                variant="elevated"
                className="p-6 hover:border-blue-500/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Icon name="upload" className="text-blue-400" size="lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Import Questions</h3>
                    <p className="text-sm text-text-muted">Bulk import from JSON</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardContent({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  href?: string | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`size-12 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon name={icon} className={color} size="lg" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    </div>
  );
}
