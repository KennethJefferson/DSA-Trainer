"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface QuestionResult {
  id: string;
  title: string;
  type: string;
  isCorrect: boolean;
  xpEarned: number;
  hintsUsed: number;
  userAnswer: unknown;
  correctAnswer?: unknown;
}

interface QuizResults {
  quizId: string;
  quizTitle: string;
  score: number;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  timeSpent: number;
  completedAt: string;
  questions: QuestionResult[];
}

// Demo results for testing
const demoResults: QuizResults = {
  quizId: "demo",
  quizTitle: "DSA Fundamentals Quiz",
  score: 80,
  correctCount: 4,
  totalCount: 5,
  xpEarned: 85,
  timeSpent: 320,
  completedAt: new Date().toISOString(),
  questions: [
    { id: "q1", title: "Binary Search Time Complexity", type: "multiple_choice", isCorrect: true, xpEarned: 15, hintsUsed: 0, userAnswer: "b" },
    { id: "q2", title: "Queue Data Structure", type: "true_false", isCorrect: true, xpEarned: 10, hintsUsed: 0, userAnswer: false },
    { id: "q3", title: "Valid Stack Operations", type: "multi_select", isCorrect: true, xpEarned: 15, hintsUsed: 1, userAnswer: ["a", "b", "c", "e"] },
    { id: "q4", title: "QuickSort Steps", type: "drag_order", isCorrect: true, xpEarned: 25, hintsUsed: 0, userAnswer: ["s1", "s2", "s3", "s4"] },
    { id: "q5", title: "Complete the Binary Search", type: "fill_blank", isCorrect: false, xpEarned: 0, hintsUsed: 2, userAnswer: { start: "0", prop: "len", op: "<=", update: "mid + 1" } },
  ],
};

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading results
    // In a real app, this would fetch from API
    const timer = setTimeout(() => {
      setResults(demoResults);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [quizId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-error";
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { letter: "A", label: "Excellent!" };
    if (score >= 80) return { letter: "B", label: "Great job!" };
    if (score >= 70) return { letter: "C", label: "Good effort!" };
    if (score >= 60) return { letter: "D", label: "Keep practicing!" };
    return { letter: "F", label: "Try again!" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <Card variant="elevated" className="max-w-md mx-auto text-center">
        <Icon name="error" size="xl" className="text-error mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Results Not Found</h2>
        <p className="text-text-muted mb-4">
          We couldn&apos;t find the results for this quiz.
        </p>
        <Link href="/quizzes">
          <Button variant="secondary">Browse Quizzes</Button>
        </Link>
      </Card>
    );
  }

  const grade = getGrade(results.score);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Results Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
        <p className="text-text-muted">{results.quizTitle}</p>
      </div>

      {/* Score Card */}
      <Card variant="elevated" className="text-center !p-8">
        <div className="relative inline-block mb-6">
          {/* Score circle */}
          <div
            className={cn(
              "w-40 h-40 rounded-full border-8 flex items-center justify-center",
              results.score >= 70 ? "border-success" : "border-error"
            )}
          >
            <div>
              <span className={cn("text-5xl font-bold", getScoreColor(results.score))}>
                {results.score}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div
            className={cn(
              "text-6xl font-bold",
              results.score >= 70 ? "text-success" : "text-error"
            )}
          >
            {grade.letter}
          </div>
          <p className="text-xl text-text-muted">{grade.label}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface">
            <Icon name="check_circle" className="text-success mb-2" />
            <p className="text-2xl font-bold text-white">
              {results.correctCount}/{results.totalCount}
            </p>
            <p className="text-xs text-text-muted">Correct</p>
          </div>
          <div className="p-4 rounded-xl bg-surface">
            <Icon name="military_tech" className="text-primary mb-2" />
            <p className="text-2xl font-bold text-white">+{results.xpEarned}</p>
            <p className="text-xs text-text-muted">XP Earned</p>
          </div>
          <div className="p-4 rounded-xl bg-surface">
            <Icon name="timer" className="text-info mb-2" />
            <p className="text-2xl font-bold text-white">{formatTime(results.timeSpent)}</p>
            <p className="text-xs text-text-muted">Time Spent</p>
          </div>
          <div className="p-4 rounded-xl bg-surface">
            <Icon name="lightbulb" className="text-warning mb-2" />
            <p className="text-2xl font-bold text-white">
              {results.questions.reduce((sum, q) => sum + q.hintsUsed, 0)}
            </p>
            <p className="text-xs text-text-muted">Hints Used</p>
          </div>
        </div>
      </Card>

      {/* Question Breakdown */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Question Breakdown</h2>
        <div className="space-y-3">
          {results.questions.map((question, index) => (
            <Card
              key={question.id}
              variant="elevated"
              className={cn(
                "!p-4 flex items-center gap-4",
                question.isCorrect ? "border-l-4 border-l-success" : "border-l-4 border-l-error"
              )}
            >
              {/* Question number */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  question.isCorrect ? "bg-success/20 text-success" : "bg-error/20 text-error"
                )}
              >
                {index + 1}
              </div>

              {/* Question info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {question.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted capitalize">
                    {question.type.replace(/_/g, " ")}
                  </span>
                  {question.hintsUsed > 0 && (
                    <span className="text-xs text-warning">
                      {question.hintsUsed} hint{question.hintsUsed > 1 ? "s" : ""} used
                    </span>
                  )}
                </div>
              </div>

              {/* Result */}
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "text-sm font-medium",
                    question.xpEarned > 0 ? "text-success" : "text-text-muted"
                  )}
                >
                  +{question.xpEarned} XP
                </span>
                <Icon
                  name={question.isCorrect ? "check_circle" : "cancel"}
                  className={question.isCorrect ? "text-success" : "text-error"}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={`/quiz/${quizId}`}>
          <Button variant="secondary" className="w-full sm:w-auto">
            <Icon name="replay" size="sm" className="mr-2" />
            Retry Quiz
          </Button>
        </Link>
        <Link href="/quizzes">
          <Button className="w-full sm:w-auto">
            <Icon name="explore" size="sm" className="mr-2" />
            More Quizzes
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full sm:w-auto">
            <Icon name="home" size="sm" className="mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
