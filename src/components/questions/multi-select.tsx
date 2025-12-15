"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import type { BaseQuestionProps, MultiSelectContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: MultiSelectContent;
  };
}

export function MultiSelectQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (userAnswer as string[]) || []
  );

  const content = question.content;

  // Shuffle options if needed
  const options = useMemo(() => {
    if (!content.shuffleOptions) return content.options;
    return [...content.options].sort(() => Math.random() - 0.5);
  }, [content.options, content.shuffleOptions]);

  useEffect(() => {
    if (userAnswer) {
      setSelectedIds(userAnswer as string[]);
    }
  }, [userAnswer]);

  const handleToggle = (optionId: string) => {
    if (disabled) return;

    const newSelected = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    setSelectedIds(newSelected);
    onAnswer(newSelected);
  };

  const getOptionState = (option: (typeof options)[0]) => {
    const isSelected = selectedIds.includes(option.id);

    if (!showResult) {
      return isSelected ? "selected" : "default";
    }

    if (option.isCorrect && isSelected) {
      return "correct";
    }

    if (option.isCorrect && !isSelected) {
      return "missed"; // Should have been selected
    }

    if (!option.isCorrect && isSelected) {
      return "incorrect";
    }

    return "default";
  };

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div className="text-lg text-white font-medium">{content.question}</div>

      {/* Instruction */}
      {content.instruction && (
        <p className="text-sm text-text-muted">{content.instruction}</p>
      )}

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const state = getOptionState(option);
          const isSelected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              disabled={disabled}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                state === "default" && "bg-surface border-surface-border",
                state === "selected" && "bg-primary/10 border-primary",
                state === "correct" && "bg-success/10 border-success",
                state === "incorrect" && "bg-error/10 border-error",
                state === "missed" && "bg-warning/10 border-warning",
                disabled && "cursor-not-allowed opacity-75"
              )}
            >
              {/* Checkbox indicator */}
              <span
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center",
                  state === "default" && "border-surface-border bg-surface-light",
                  state === "selected" && "border-primary bg-primary",
                  state === "correct" && "border-success bg-success",
                  state === "incorrect" && "border-error bg-error",
                  state === "missed" && "border-warning bg-transparent"
                )}
              >
                {(isSelected || state === "missed") && (
                  <Icon
                    name={state === "missed" ? "remove" : "check"}
                    size="sm"
                    className={cn(
                      state === "missed" ? "text-warning" : "text-white"
                    )}
                  />
                )}
              </span>

              {/* Option text */}
              <span
                className={cn(
                  "flex-1 text-sm",
                  state === "default" && "text-text-main",
                  state === "selected" && "text-white",
                  state === "correct" && "text-success",
                  state === "incorrect" && "text-error",
                  state === "missed" && "text-warning"
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
