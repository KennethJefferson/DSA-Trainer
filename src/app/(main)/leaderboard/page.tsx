import { Card, Icon } from "@/components/ui";

export const metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-text-muted mt-1">
            See how you rank against other learners
          </p>
        </div>
      </div>

      <Card variant="elevated" className="text-center py-16">
        <Icon name="trophy" size="xl" className="text-text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-text-muted">
          Complete quizzes to earn XP and climb the leaderboard!
        </p>
      </Card>
    </div>
  );
}
