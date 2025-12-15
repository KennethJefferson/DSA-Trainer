import Link from "next/link";
import { Card, Icon, Button } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Quizzes",
};

// Demo quiz data
const demoQuizzes = [
  {
    id: "demo",
    title: "DSA Fundamentals Quiz",
    description: "Test your knowledge of basic data structures and algorithms concepts.",
    difficulty: "mixed",
    questionCount: 5,
    totalXp: 95,
    timeLimit: 600,
    topics: ["Arrays", "Stacks", "Searching", "Sorting"],
  },
];

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

      {/* Demo Quiz */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Featured Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              variant="elevated"
              className="!p-0 overflow-hidden group hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 border-b border-surface-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                    Demo
                  </span>
                  <span className="text-xs text-text-muted">
                    {Math.floor(quiz.timeLimit / 60)} min
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {quiz.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {quiz.description}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {quiz.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 rounded bg-surface text-xs text-text-muted"
                    >
                      {topic}
                    </span>
                  ))}
                  {quiz.topics.length > 3 && (
                    <span className="px-2 py-1 rounded bg-surface text-xs text-text-muted">
                      +{quiz.topics.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-text-muted">
                    <Icon name="quiz" size="sm" className="inline mr-1" />
                    {quiz.questionCount} questions
                  </span>
                  <span className="text-primary font-medium">
                    +{quiz.totalXp} XP
                  </span>
                </div>

                {/* Action */}
                <Link href={`/quiz/${quiz.id}`}>
                  <Button className="w-full">
                    <Icon name="play_arrow" size="sm" className="mr-2" />
                    Start Quiz
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">More Quizzes</h2>
        <Card variant="elevated" className="text-center py-12">
          <Icon name="add_circle" size="xl" className="text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">More Coming Soon</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Additional quizzes will be available once more questions are added to the system.
            Try the demo quiz above to see all question types in action!
          </p>
        </Card>
      </div>
    </div>
  );
}
