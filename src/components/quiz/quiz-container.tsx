"use client";

import { useState } from "react";
import { useQuiz } from "./quiz-context";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { QuizTimer } from "./quiz-timer";
import { QuestionMap } from "./question-map";
import { QuizHints } from "./quiz-hints";
import { QuizSubmitModal } from "./quiz-submit-modal";
import { Icon, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import Link from "next/link";

export function QuizContainer() {
  const {
    state,
    currentQuestion,
    setAnswer,
    canGoNext,
    canGoPrev,
    nextQuestion,
    prevQuestion,
  } = useQuiz();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">No questions available</p>
      </div>
    );
  }

  const userAnswer = state.answers[currentQuestion.id];
  const isReviewing = state.status === "reviewing";
  const questionResult = state.results?.questionResults.find(
    (r) => r.questionId === currentQuestion.id
  );

  const toggleBookmark = () => {
    const newBookmarks = new Set(bookmarked);
    if (bookmarked.has(currentQuestion.id)) {
      newBookmarks.delete(currentQuestion.id);
    } else {
      newBookmarks.add(currentQuestion.id);
    }
    setBookmarked(newBookmarks);
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      {/* Top Navigation Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-border-dark bg-surface-dark/50 backdrop-blur-md px-6 py-4 mb-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
            <Icon name="school" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-white">DSA Fundamentals</h2>
            <p className="text-xs text-text-muted font-medium">Module: Quiz {state.quizId}</p>
          </div>
        </div>
        <Link href="/quizzes">
          <Button variant="outline" size="sm">
            <Icon name="logout" className="mr-2" />
            Exit Quiz
          </Button>
        </Link>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Sidebar / Question Navigator (Left) */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
          {/* Timer Card */}
          {state.timeRemaining !== null && <QuizTimer />}

          {/* Progress & Map */}
          <QuestionMap />
        </aside>

        {/* Main Content Area (Right) */}
        <main className="flex-1 flex flex-col order-1 lg:order-2">
          {/* Question Card */}
          <div className="bg-surface-dark rounded-2xl p-6 lg:p-10 border border-border-dark shadow-lg flex-1 flex flex-col">
            {/* Question Meta */}
            <div className="flex justify-between items-center mb-6">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                Question {state.currentIndex + 1} of {state.questions.length}
              </span>
              <button
                onClick={toggleBookmark}
                className="text-text-muted hover:text-primary transition-colors"
                title="Bookmark Question"
              >
                <Icon name={bookmarked.has(currentQuestion.id) ? "bookmark" : "bookmark_border"} />
              </button>
            </div>

            {/* Question Header */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium uppercase",
                  currentQuestion.difficulty === "beginner" && "bg-blue-500/20 text-blue-400",
                  currentQuestion.difficulty === "easy" && "bg-green-500/20 text-green-400",
                  currentQuestion.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                  currentQuestion.difficulty === "hard" && "bg-orange-500/20 text-orange-400",
                  currentQuestion.difficulty === "expert" && "bg-red-500/20 text-red-400"
                )}
              >
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-text-muted">+{currentQuestion.xpReward} XP</span>

              {/* Result badge when reviewing */}
              {isReviewing && questionResult && (
                <span
                  className={cn(
                    "ml-auto px-3 py-1 rounded-full text-xs font-medium",
                    questionResult.isCorrect
                      ? "bg-success/20 text-success"
                      : "bg-error/20 text-error"
                  )}
                >
                  {questionResult.isCorrect ? "Correct" : "Incorrect"}
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-8 text-white">
              {currentQuestion.title}
            </h1>

            {/* Question content */}
            <div className="mb-8 flex-1">
              <QuestionRenderer
                question={currentQuestion}
                onAnswer={setAnswer}
                disabled={state.status !== "in_progress"}
                showResult={isReviewing}
                userAnswer={userAnswer}
                isCorrect={questionResult?.isCorrect}
              />
            </div>

            {/* Explanation (shown when reviewing) */}
            {isReviewing && currentQuestion.explanation && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                  <Icon name="lightbulb" className="text-sm" />
                  Explanation
                </h4>
                <p className="text-sm text-text-muted">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Hints section */}
            {state.status === "in_progress" && currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div className="mb-6">
                <QuizHints />
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-auto pt-6 border-t border-border-dark flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={!canGoPrev}
                className="w-full sm:w-auto group"
              >
                <Icon name="arrow_back" className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Previous
              </Button>

              {canGoNext ? (
                <Button
                  onClick={nextQuestion}
                  className="w-full sm:w-auto group"
                >
                  Next Question
                  <Icon name="arrow_forward" className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full sm:w-auto"
                >
                  <Icon name="check_circle" className="mr-2" />
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Submit confirmation modal */}
      <QuizSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
