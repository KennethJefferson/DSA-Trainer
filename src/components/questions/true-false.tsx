"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import type { BaseQuestionProps, TrueFalseContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: TrueFalseContent;
  };
}

export function TrueFalseQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const [selected, setSelected] = useState<boolean | null>(
    userAnswer !== undefined ? (userAnswer as boolean) : null
  );

  const content = question.content;

  useEffect(() => {
    if (userAnswer !== undefined) {
      setSelected(userAnswer as boolean);
    }
  }, [userAnswer]);

  const handleSelect = (value: boolean) => {
    if (disabled) return;
    setSelected(value);
    onAnswer(value);
  };

  const getButtonState = (value: boolean) => {
    if (!showResult) {
      return selected === value ? "selected" : "default";
    }

    const isCorrect = content.isTrue === value;

    if (isCorrect && selected === value) {
      return "correct";
    }

    if (isCorrect && selected !== value) {
      return "missed";
    }

    if (!isCorrect && selected === value) {
      return "incorrect";
    }

    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Statement */}
      <div className="p-6 bg-surface rounded-xl border border-surface-border">
        <p className="text-lg text-white font-medium leading-relaxed">
          &ldquo;{content.statement}&rdquo;
        </p>
      </div>

      {/* True/False buttons */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { value: true, label: "True", icon: "check_circle" },
          { value: false, label: "False", icon: "cancel" },
        ].map(({ value, label, icon }) => {
          const state = getButtonState(value);

          return (
            <button
              key={label}
              onClick={() => handleSelect(value)}
              disabled={disabled}
              className={cn(
                "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                state === "default" && "bg-surface border-surface-border",
                state === "selected" && "bg-primary/10 border-primary",
                state === "correct" && "bg-success/10 border-success",
                state === "incorrect" && "bg-error/10 border-error",
                state === "missed" && "bg-warning/10 border-warning",
                disabled && "cursor-not-allowed opacity-75"
              )}
            >
              <Icon
                name={icon}
                size="xl"
                className={cn(
                  state === "default" && "text-text-muted",
                  state === "selected" && "text-primary",
                  state === "correct" && "text-success",
                  state === "incorrect" && "text-error",
                  state === "missed" && "text-warning"
                )}
              />
              <span
                className={cn(
                  "font-bold text-lg",
                  state === "default" && "text-text-main",
                  state === "selected" && "text-primary",
                  state === "correct" && "text-success",
                  state === "incorrect" && "text-error",
                  state === "missed" && "text-warning"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
