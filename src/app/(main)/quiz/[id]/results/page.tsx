"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Icon } from "@/components/ui";
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
  explanation?: string;
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
  streak?: number;
  questions: QuestionResult[];
}

// Demo results for testing
const demoResults: QuizResults = {
  quizId: "demo",
  quizTitle: "DSA Fundamentals Quiz",
  score: 85,
  correctCount: 4,
  totalCount: 5,
  xpEarned: 150,
  timeSpent: 725,
  streak: 5,
  completedAt: new Date().toISOString(),
  questions: [
    {
      id: "q1",
      title: "Binary Search Time Complexity",
      type: "multiple_choice",
      isCorrect: true,
      xpEarned: 15,
      hintsUsed: 0,
      userAnswer: "b",
      correctAnswer: "b",
      explanation: "Binary search divides the array in half each iteration, resulting in O(log n) complexity."
    },
    {
      id: "q2",
      title: "Queue Data Structure",
      type: "true_false",
      isCorrect: true,
      xpEarned: 10,
      hintsUsed: 0,
      userAnswer: false,
      correctAnswer: false,
      explanation: "A Queue follows FIFO (First In, First Out), not LIFO."
    },
    {
      id: "q3",
      title: "Valid Stack Operations",
      type: "multi_select",
      isCorrect: true,
      xpEarned: 15,
      hintsUsed: 1,
      userAnswer: ["a", "b", "c", "e"],
      correctAnswer: ["a", "b", "c", "e"],
      explanation: "push(), pop(), peek(), and isEmpty() are standard stack operations."
    },
    {
      id: "q4",
      title: "QuickSort Steps",
      type: "drag_order",
      isCorrect: true,
      xpEarned: 25,
      hintsUsed: 0,
      userAnswer: ["s1", "s2", "s3", "s4"],
      correctAnswer: ["s1", "s2", "s3", "s4"],
      explanation: "QuickSort: choose pivot, partition, recursively sort left, recursively sort right."
    },
    {
      id: "q5",
      title: "Complete the Binary Search",
      type: "fill_blank",
      isCorrect: false,
      xpEarned: 0,
      hintsUsed: 2,
      userAnswer: "len",
      correctAnswer: "length",
      explanation: "In JavaScript, arrays use the 'length' property, not 'len'."
    },
  ],
};

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(demoResults);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [quizId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
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
      <div className="bg-surface-dark rounded-xl p-8 max-w-md mx-auto text-center">
        <Icon name="error" size="xl" className="text-error mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Results Not Found</h2>
        <p className="text-text-muted mb-4">
          We couldn&apos;t find the results for this quiz.
        </p>
        <Link href="/quizzes">
          <Button variant="secondary">Browse Quizzes</Button>
        </Link>
      </div>
    );
  }

  const passed = results.score >= 70;
  const incorrectQuestions = results.questions.filter(q => !q.isCorrect);
  const displayQuestions = showAllQuestions ? results.questions : results.questions.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
            <Icon name="verified" />
            Assessment Complete
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
            {passed ? "Great Job!" : "Keep Practicing!"}
          </h1>
          <p className="text-text-muted text-base font-normal leading-normal max-w-2xl">
            You&apos;ve completed the <span className="text-white font-medium">{results.quizTitle}</span>.
            {passed && " You are in the top 10% of learners!"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">
            <Icon name="share" className="mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Score Hero */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Score Card */}
          <div className="bg-surface-dark rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden border border-border-dark h-full min-h-[320px]">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none" />

            <h3 className="text-lg font-bold mb-6 text-white relative z-10">Final Score</h3>

            {/* Circular Progress using CSS Gradient */}
            <div
              className="relative size-48 rounded-full flex items-center justify-center mb-6"
              style={{ background: `conic-gradient(#7f13ec ${results.score}%, #4d3267 0)` }}
            >
              <div className="absolute inset-[10px] bg-surface-dark rounded-full flex flex-col items-center justify-center z-10">
                <span className="text-5xl font-black tracking-tighter text-white">{results.score}%</span>
                <span className={cn(
                  "text-sm font-medium mt-1",
                  passed ? "text-success" : "text-error"
                )}>
                  {passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>

            <p className="text-text-muted text-sm mb-6 max-w-[80%] mx-auto">
              {passed
                ? "Excellent work! You've mastered the core concepts."
                : "Keep practicing to improve your score!"}
            </p>

            <Link href="/courses" className="w-full">
              <Button className="w-full">
                Next Lesson
                <Icon name="arrow_forward" className="ml-2" />
              </Button>
            </Link>

            <Link href={`/quiz/${quizId}`} className="mt-4 text-sm text-text-muted hover:text-white transition-colors underline decoration-dotted underline-offset-4">
              Retake Quiz
            </Link>
          </div>
        </div>

        {/* Right Column: Stats & Chart */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Time */}
            <div className="bg-surface-dark rounded-xl p-5 border border-border-dark flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <Icon name="timer" className="text-[20px]" />
                <span className="text-xs font-bold uppercase tracking-wider">Time</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(results.timeSpent)}</p>
              <p className="text-xs text-green-400 font-medium">-1.5m vs avg</p>
            </div>

            {/* Accuracy */}
            <div className="bg-surface-dark rounded-xl p-5 border border-border-dark flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <Icon name="target" className="text-[20px]" />
                <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-white">{results.score}%</p>
              <p className="text-xs text-text-muted font-medium">{results.correctCount}/{results.totalCount} Correct</p>
            </div>

            {/* Streak */}
            <div className="bg-surface-dark rounded-xl p-5 border border-border-dark flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <Icon name="local_fire_department" className="text-[20px] text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{results.streak || 1} Days</p>
              <p className="text-xs text-orange-400 font-medium">Keep it up!</p>
            </div>

            {/* XP Gained */}
            <div className="bg-surface-dark rounded-xl p-5 border border-border-dark flex flex-col gap-1 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-primary">
                <Icon name="bolt" className="text-[100px]" />
              </div>
              <div className="flex items-center gap-2 text-text-muted mb-1 relative z-10">
                <Icon name="bolt" className="text-[20px] text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-wider">XP Gained</span>
              </div>
              <p className="text-2xl font-bold text-white relative z-10">+{results.xpEarned}</p>
              <p className="text-xs text-yellow-400 font-medium relative z-10">Level up soon</p>
            </div>
          </div>

          {/* Chart & Focus Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {/* Performance Chart */}
            <div className="bg-surface-dark rounded-xl p-6 border border-border-dark md:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Performance Trend</h3>
                  <p className="text-xs text-text-muted">Last 5 Quizzes</p>
                </div>
                <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Icon name="trending_up" className="text-[14px]" />
                  +12%
                </div>
              </div>

              {/* Chart SVG */}
              <div className="flex-1 min-h-[180px] w-full relative">
                <svg className="w-full h-full text-primary overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 478 150">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7f13ec" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7f13ec" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 109C18.1538 109 36.3077 81 54.4615 81C72.6154 81 90.7692 93 108.923 93C127.077 93 145.231 63 163.385 63C181.538 63 199.692 101 217.846 101C236 101 254.154 45 272.308 45C290.462 45 308.615 81 326.769 81C344.923 81 363.077 31 381.231 31C399.385 31 417.538 55 435.692 55C453.846 55 472 25 472 25V150H0V109Z" fill="url(#chartGradient)" />
                  <path d="M0 109C18.1538 109 36.3077 81 54.4615 81C72.6154 81 90.7692 93 108.923 93C127.077 93 145.231 63 163.385 63C181.538 63 199.692 101 217.846 101C236 101 254.154 45 272.308 45C290.462 45 308.615 81 326.769 81C344.923 81 363.077 31 381.231 31C399.385 31 417.538 55 435.692 55C453.846 55 472 25 472 25" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                  <circle className="fill-background stroke-primary stroke-2" cx="108" cy="93" r="4" />
                  <circle className="fill-background stroke-primary stroke-2" cx="217" cy="101" r="4" />
                  <circle className="fill-background stroke-primary stroke-2" cx="326" cy="81" r="4" />
                  <circle className="fill-white stroke-primary" strokeWidth="4" cx="472" cy="25" r="6" />
                </svg>
              </div>

              <div className="flex justify-between mt-2 px-2">
                <p className="text-text-muted text-xs">Quiz 1</p>
                <p className="text-text-muted text-xs">Quiz 2</p>
                <p className="text-text-muted text-xs">Quiz 3</p>
                <p className="text-text-muted text-xs">Quiz 4</p>
                <p className="text-primary font-bold text-xs">Today</p>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="bg-surface-dark rounded-xl p-6 border border-border-dark flex flex-col md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="lightbulb" className="text-yellow-400" />
                <h3 className="text-base font-bold text-white">Focus Areas</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">Based on your incorrect answers, we recommend reviewing:</p>

              {incorrectQuestions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {incorrectQuestions.slice(0, 2).map((q) => (
                    <Link
                      key={q.id}
                      href="/courses"
                      className="group flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-border-dark transition-all"
                    >
                      <div className="size-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <Icon name="functions" className="text-[16px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{q.title}</p>
                        <p className="text-[10px] text-text-muted capitalize">{q.type.replace(/_/g, " ")}</p>
                      </div>
                      <Icon name="chevron_right" className="text-text-muted group-hover:text-white text-[18px]" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <Icon name="check_circle" className="text-success text-3xl mb-2" />
                    <p className="text-sm text-text-muted">Perfect score! No areas to focus on.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-bold text-white">Question Review</h2>
        <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
          {displayQuestions.map((question, index) => (
            <div key={question.id}>
              {/* Question Row */}
              <div
                onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                className={cn(
                  "border-b border-border-dark p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-surface-light transition-colors cursor-pointer group",
                  expandedQuestion === question.id && "bg-surface-light/50"
                )}
              >
                <div className="flex items-start md:items-center gap-4 flex-1">
                  <div className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 mt-1 md:mt-0",
                    question.isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  )}>
                    <Icon name={question.isCorrect ? "check" : "close"} className="text-[18px] font-bold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wide">Question {index + 1}</span>
                    <p className="text-sm md:text-base font-medium text-white">{question.title}</p>
                  </div>
                </div>
                <div className="pl-12 md:pl-0 flex items-center justify-between md:justify-end gap-6 min-w-[200px]">
                  <span className={cn(
                    "text-sm font-bold",
                    question.isCorrect ? "text-green-500" : "text-red-400"
                  )}>
                    {question.isCorrect ? `Correct (+${question.xpEarned} pts)` : "Incorrect (0 pts)"}
                  </span>
                  <Icon
                    name="expand_more"
                    className={cn(
                      "text-text-muted group-hover:text-white transition-transform",
                      expandedQuestion === question.id && "rotate-180"
                    )}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              {expandedQuestion === question.id && (
                <div className="px-4 pb-6 pl-16 md:pl-16 pr-4 md:pr-10 bg-surface-light/30">
                  {!question.isCorrect && (
                    <div className="bg-red-500/10 rounded-lg p-4 mb-3 border border-red-500/20">
                      <div className="flex gap-2 text-sm">
                        <span className="font-bold text-red-400 min-w-[80px]">Your Answer:</span>
                        <span className="text-text-muted line-through">{String(question.userAnswer)}</span>
                      </div>
                      <div className="flex gap-2 text-sm mt-2">
                        <span className="font-bold text-green-400 min-w-[80px]">Correct:</span>
                        <span className="text-white font-medium">{String(question.correctAnswer)}</span>
                      </div>
                    </div>
                  )}
                  {question.explanation && (
                    <div className="flex items-start gap-2 text-sm text-text-muted">
                      <Icon name="info" className="text-[18px] mt-0.5 text-primary" />
                      <p>{question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {results.questions.length > 3 && !showAllQuestions && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAllQuestions(true)}
              className="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              Load all {results.questions.length} questions
              <Icon name="expand_more" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full sm:w-auto">
            <Icon name="home" className="mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href="/quizzes">
          <Button className="w-full sm:w-auto">
            <Icon name="explore" className="mr-2" />
            More Quizzes
          </Button>
        </Link>
      </div>
    </div>
  );
}
