"use client";

import { useState } from "react";
import { useQuiz } from "./quiz-context";
import { Button, Icon, Card } from "@/components/ui";
import { cn } from "@/lib/cn";

export function QuizHints() {
  const { state, currentQuestion, useHint } = useQuiz();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentQuestion?.hints || currentQuestion.hints.length === 0) {
    return null;
  }

  const usedHintIds = state.hintsUsed[currentQuestion.id] || [];
  const sortedHints = [...currentQuestion.hints].sort((a, b) => a.order - b.order);

  const nextHint = sortedHints.find((h) => !usedHintIds.includes(h.id));
  const totalPenalty = sortedHints
    .filter((h) => usedHintIds.includes(h.id))
    .reduce((sum, h) => sum + h.xpPenalty, 0);

  return (
    <Card variant="bordered" className="!p-0 border-warning/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon name="lightbulb" className="text-warning" />
          <span className="text-sm font-medium text-white">
            Hints ({usedHintIds.length}/{sortedHints.length} used)
          </span>
          {totalPenalty > 0 && (
            <span className="text-xs text-warning">-{totalPenalty} XP</span>
          )}
        </div>
        <Icon
          name="expand_more"
          className={cn(
            "text-text-muted transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Used hints */}
          {sortedHints.map((hint, index) => {
            const isUsed = usedHintIds.includes(hint.id);

            if (!isUsed) return null;

            return (
              <div
                key={hint.id}
                className="p-3 rounded-lg bg-warning/10 border border-warning/20"
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-text-main">{hint.text}</p>
                    <p className="text-xs text-warning mt-1">
                      -{hint.xpPenalty} XP penalty
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Next hint button */}
          {nextHint && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => useHint(nextHint.id)}
              className="w-full border-warning text-warning hover:bg-warning/10"
            >
              <Icon name="lightbulb" size="sm" className="mr-2" />
              Show Hint {usedHintIds.length + 1} (-{nextHint.xpPenalty} XP)
            </Button>
          )}

          {!nextHint && usedHintIds.length === sortedHints.length && (
            <p className="text-center text-xs text-text-muted">
              All hints have been revealed
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
