"use client";

import { Button, Icon } from "@/components/ui";

interface QuizNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

export function QuizNavigation({
  onPrev,
  onNext,
  canPrev,
  canNext,
  onSubmit,
  isLastQuestion,
}: QuizNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={!canPrev}
        className="gap-2"
      >
        <Icon name="arrow_back" size="sm" />
        Previous
      </Button>

      <div className="flex items-center gap-3">
        {isLastQuestion ? (
          <Button onClick={onSubmit} className="gap-2">
            Finish Quiz
            <Icon name="check" size="sm" />
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canNext} className="gap-2">
            Next
            <Icon name="arrow_forward" size="sm" />
          </Button>
        )}
      </div>
    </div>
  );
}
