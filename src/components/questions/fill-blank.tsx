"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import type { BaseQuestionProps, FillBlankContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: FillBlankContent;
  };
}

export function FillBlankQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const content = question.content;

  const [answers, setAnswers] = useState<Record<string, string>>(
    (userAnswer as Record<string, string>) || {}
  );

  useEffect(() => {
    if (userAnswer) {
      setAnswers(userAnswer as Record<string, string>);
    }
  }, [userAnswer]);

  // Parse template and identify blanks
  const templateParts = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g;
    const parts: Array<{ type: "text" | "blank"; content: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content.template)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.template.slice(lastIndex, match.index),
        });
      }

      // Add the blank
      parts.push({
        type: "blank",
        content: match[1], // The blank ID
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.template.length) {
      parts.push({
        type: "text",
        content: content.template.slice(lastIndex),
      });
    }

    return parts;
  }, [content.template]);

  const handleChange = (blankId: string, value: string) => {
    if (disabled) return;

    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  const getBlankState = (blankId: string) => {
    if (!showResult) return "default";

    const blank = content.blanks.find((b) => b.id === blankId);
    if (!blank) return "default";

    const userValue = answers[blankId] || "";
    const isCorrect = blank.acceptedAnswers.some((accepted) =>
      blank.caseSensitive
        ? userValue === accepted
        : userValue.toLowerCase() === accepted.toLowerCase()
    );

    return isCorrect ? "correct" : "incorrect";
  };

  const getCorrectAnswer = (blankId: string) => {
    const blank = content.blanks.find((b) => b.id === blankId);
    return blank?.acceptedAnswers[0] || "";
  };

  return (
    <div className="space-y-4">
      {/* Code template with blanks */}
      <div
        className={cn(
          "p-4 rounded-xl border border-surface-border font-mono text-sm overflow-x-auto",
          content.language ? "bg-[#1e1e1e]" : "bg-surface"
        )}
      >
        <pre className="whitespace-pre-wrap">
          {templateParts.map((part, index) => {
            if (part.type === "text") {
              return (
                <span key={index} className="text-text-main">
                  {part.content}
                </span>
              );
            }

            const blankId = part.content;
            const blank = content.blanks.find((b) => b.id === blankId);
            const state = getBlankState(blankId);

            return (
              <span key={index} className="inline-block align-middle mx-1">
                <input
                  type="text"
                  value={answers[blankId] || ""}
                  onChange={(e) => handleChange(blankId, e.target.value)}
                  placeholder={blank?.placeholder || "___"}
                  disabled={disabled}
                  className={cn(
                    "px-2 py-1 rounded border-2 text-center min-w-[80px] max-w-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "font-mono text-sm",
                    state === "default" &&
                      "bg-surface-light border-surface-border text-white",
                    state === "correct" && "bg-success/20 border-success text-success",
                    state === "incorrect" && "bg-error/20 border-error text-error",
                    disabled && "cursor-not-allowed opacity-75"
                  )}
                  style={{
                    width: `${Math.max(80, (answers[blankId]?.length || blank?.placeholder?.length || 3) * 10 + 20)}px`,
                  }}
                />
                {showResult && state === "incorrect" && (
                  <span className="ml-2 text-success text-xs">
                    ({getCorrectAnswer(blankId)})
                  </span>
                )}
              </span>
            );
          })}
        </pre>
      </div>

      {/* Language indicator */}
      {content.language && (
        <div className="text-xs text-text-muted">
          Language: <span className="text-primary">{content.language}</span>
        </div>
      )}
    </div>
  );
}
