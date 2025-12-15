"use client";

import { useQuiz } from "./quiz-context";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface QuizHeaderProps {
  onSubmit: () => void;
}

export function QuizHeader({ onSubmit }: QuizHeaderProps) {
  const { state, progress, answeredCount, goToQuestion } = useQuiz();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = state.timeRemaining !== null && state.timeRemaining < 60;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Progress indicator */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">
            Question{" "}
            <span className="text-white font-bold">
              {state.currentIndex + 1}
            </span>{" "}
            of {state.questions.length}
          </span>
          <span className="text-sm text-text-muted">
            •{" "}
            <span className="text-white font-medium">{answeredCount}</span> answered
          </span>
        </div>

        {/* Timer and submit */}
        <div className="flex items-center gap-4">
          {state.timeRemaining !== null && state.status === "in_progress" && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                isLowTime ? "bg-error/20 text-error" : "bg-surface text-text-main"
              )}
            >
              <Icon name="timer" size="sm" />
              <span className="font-mono font-bold">
                {formatTime(state.timeRemaining)}
              </span>
            </div>
          )}

          {state.status === "in_progress" && (
            <Button size="sm" onClick={onSubmit}>
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-2">
        {state.questions.map((q, index) => {
          const isAnswered = state.answers[q.id] !== undefined;
          const isCurrent = index === state.currentIndex;
          const result = state.results?.questionResults.find(
            (r) => r.questionId === q.id
          );

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
                isCurrent && "ring-2 ring-primary",
                // Default states
                !result && !isAnswered && "bg-surface-light text-text-muted",
                !result && isAnswered && "bg-primary/20 text-primary",
                // Result states
                result?.isCorrect && "bg-success/20 text-success",
                result && !result.isCorrect && "bg-error/20 text-error"
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
