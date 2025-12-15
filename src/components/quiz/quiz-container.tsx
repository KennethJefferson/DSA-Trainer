"use client";

import { useState } from "react";
import { useQuiz } from "./quiz-context";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { QuizHeader } from "./quiz-header";
import { QuizNavigation } from "./quiz-navigation";
import { QuizHints } from "./quiz-hints";
import { QuizSubmitModal } from "./quiz-submit-modal";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with progress and timer */}
      <QuizHeader onSubmit={() => setShowSubmitModal(true)} />

      {/* Question card */}
      <Card variant="elevated" className="!p-0 overflow-hidden">
        {/* Question header */}
        <div className="p-4 bg-surface border-b border-surface-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    currentQuestion.difficulty === "beginner" && "bg-blue-500/20 text-blue-400",
                    currentQuestion.difficulty === "easy" && "bg-green-500/20 text-green-400",
                    currentQuestion.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                    currentQuestion.difficulty === "hard" && "bg-orange-500/20 text-orange-400",
                    currentQuestion.difficulty === "expert" && "bg-red-500/20 text-red-400"
                  )}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-text-muted">
                  +{currentQuestion.xpReward} XP
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{currentQuestion.title}</h2>
            </div>

            {/* Result badge when reviewing */}
            {isReviewing && questionResult && (
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  questionResult.isCorrect
                    ? "bg-success/20 text-success"
                    : "bg-error/20 text-error"
                )}
              >
                {questionResult.isCorrect ? "Correct" : "Incorrect"}
              </div>
            )}
          </div>
        </div>

        {/* Question content */}
        <div className="p-6">
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
          <div className="p-4 bg-primary/5 border-t border-surface-border">
            <h4 className="text-sm font-medium text-primary mb-2">Explanation</h4>
            <p className="text-sm text-text-muted">{currentQuestion.explanation}</p>
          </div>
        )}
      </Card>

      {/* Hints section */}
      {state.status === "in_progress" && currentQuestion.hints && currentQuestion.hints.length > 0 && (
        <QuizHints />
      )}

      {/* Navigation */}
      <QuizNavigation
        onPrev={prevQuestion}
        onNext={nextQuestion}
        canPrev={canGoPrev}
        canNext={canGoNext}
        onSubmit={() => setShowSubmitModal(true)}
        isLastQuestion={!canGoNext}
      />

      {/* Submit confirmation modal */}
      <QuizSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
