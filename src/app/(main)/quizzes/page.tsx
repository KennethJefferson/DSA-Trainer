import { Card, Icon } from "@/components/ui";

export const metadata = {
  title: "Quizzes",
};

export default function QuizzesPage() {
  return (
    <div className="max-w-[1600px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Quizzes</h1>
          <p className="text-text-muted mt-1">
            Test your knowledge with interactive quizzes
          </p>
        </div>
      </div>

      <Card variant="elevated" className="text-center py-16">
        <Icon name="quiz" size="xl" className="text-text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h2>
        <p className="text-text-muted">
          Quizzes will appear here once questions are added to the system.
        </p>
      </Card>
    </div>
  );
}
