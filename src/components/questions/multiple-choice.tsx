"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import type { BaseQuestionProps, MultipleChoiceContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: MultipleChoiceContent;
  };
}

export function MultipleChoiceQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
  isCorrect,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    (userAnswer as string) || null
  );

  const content = question.content;

  // Shuffle options if needed (memoized to prevent re-shuffle on re-render)
  const options = useMemo(() => {
    if (!content.shuffleOptions) return content.options;
    return [...content.options].sort(() => Math.random() - 0.5);
  }, [content.options, content.shuffleOptions]);

  useEffect(() => {
    if (userAnswer) {
      setSelectedId(userAnswer as string);
    }
  }, [userAnswer]);

  const handleSelect = (optionId: string) => {
    if (disabled) return;
    setSelectedId(optionId);
    onAnswer(optionId);
  };

  const getOptionState = (option: (typeof options)[0]) => {
    if (!showResult) {
      return selectedId === option.id ? "selected" : "default";
    }

    if (option.isCorrect) {
      return "correct";
    }

    if (selectedId === option.id && !option.isCorrect) {
      return "incorrect";
    }

    return "default";
  };

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div className="text-lg text-white font-medium">{content.question}</div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const state = getOptionState(option);
          const letter = String.fromCharCode(65 + index); // A, B, C, D...

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={disabled}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                state === "default" && "bg-surface border-surface-border",
                state === "selected" && "bg-primary/10 border-primary",
                state === "correct" && "bg-success/10 border-success",
                state === "incorrect" && "bg-error/10 border-error",
                disabled && "cursor-not-allowed opacity-75"
              )}
            >
              {/* Letter indicator */}
              <span
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  state === "default" && "bg-surface-light text-text-muted",
                  state === "selected" && "bg-primary text-white",
                  state === "correct" && "bg-success text-white",
                  state === "incorrect" && "bg-error text-white"
                )}
              >
                {showResult && state === "correct" ? (
                  <Icon name="check" size="sm" />
                ) : showResult && state === "incorrect" ? (
                  <Icon name="close" size="sm" />
                ) : (
                  letter
                )}
              </span>

              {/* Option text */}
              <span
                className={cn(
                  "flex-1 text-sm",
                  state === "default" && "text-text-main",
                  state === "selected" && "text-white",
                  state === "correct" && "text-success",
                  state === "incorrect" && "text-error"
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
