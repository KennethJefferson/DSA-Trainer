"use client";

import { useQuiz } from "./quiz-context";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

export function QuestionMap() {
  const { state, goToQuestion } = useQuiz();

  const totalQuestions = state.questions.length;
  const answeredCount = Object.keys(state.answers).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="bg-surface-dark rounded-xl p-5 border border-border-dark shadow-sm flex-1">
      {/* Progress Header */}
      <div className="flex justify-between items-end mb-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Progress</p>
        <p className="text-sm font-bold text-primary">{progress}%</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-background rounded-full h-2.5 mb-8">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-3">
        {state.questions.map((question, index) => {
          const isAnswered = state.answers[question.id] !== undefined;
          const isCurrent = index === state.currentIndex;

          return (
            <button
              key={question.id}
              onClick={() => goToQuestion(index)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                isAnswered && !isCurrent && "bg-primary text-white shadow-md shadow-primary/20 hover:scale-105",
                isCurrent && "bg-surface-dark border-2 border-primary text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background hover:scale-105",
                !isAnswered && !isCurrent && "bg-background/50 text-text-muted border border-transparent hover:border-border-dark"
              )}
            >
              {isAnswered && !isCurrent ? (
                <Icon name="check" className="text-lg" />
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-border-dark">
        <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-background" />
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
