"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { Icon, Button } from "@/components/ui";
import type { BaseQuestionProps, ParsonsContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: ParsonsContent;
  };
}

interface LineAnswer {
  id: string;
  indent: number;
}

interface SortableLineProps {
  id: string;
  code: string;
  indent: number;
  maxIndent: number;
  disabled: boolean;
  state: "default" | "correct" | "incorrect" | "wrong-indent";
  onIndentChange: (delta: number) => void;
}

function SortableLine({
  id,
  code,
  indent,
  maxIndent,
  disabled,
  state,
  onIndentChange,
}: SortableLineProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 transition-all",
        isDragging && "z-50 shadow-lg scale-105"
      )}
    >
      {/* Indent controls */}
      {!disabled && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onIndentChange(-1)}
            disabled={indent <= 0}
            className={cn(
              "p-1 rounded hover:bg-surface-light transition-colors",
              indent <= 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <Icon name="chevron_left" size="sm" className="text-text-muted" />
          </button>
          <button
            onClick={() => onIndentChange(1)}
            disabled={indent >= maxIndent}
            className={cn(
              "p-1 rounded hover:bg-surface-light transition-colors",
              indent >= maxIndent && "opacity-30 cursor-not-allowed"
            )}
          >
            <Icon name="chevron_right" size="sm" className="text-text-muted" />
          </button>
        </div>
      )}

      {/* Code line with indent */}
      <div
        className={cn(
          "flex-1 p-3 rounded-lg border-2 font-mono text-sm flex items-center gap-3 transition-all",
          isDragging && "shadow-lg",
          state === "default" && "bg-[#1e1e1e] border-surface-border text-gray-300",
          state === "correct" && "bg-success/10 border-success text-success",
          state === "incorrect" && "bg-error/10 border-error text-error",
          state === "wrong-indent" && "bg-warning/10 border-warning text-warning",
          !disabled && "cursor-grab active:cursor-grabbing"
        )}
        style={{ marginLeft: `${indent * 24}px` }}
        {...attributes}
        {...listeners}
      >
        {/* Drag handle */}
        {!disabled && (
          <Icon name="drag_indicator" size="sm" className="text-text-muted flex-shrink-0" />
        )}

        {/* Code */}
        <code className="flex-1 whitespace-pre">{code}</code>

        {/* Indent indicator */}
        {state === "wrong-indent" && (
          <span className="text-xs text-warning">(wrong indent)</span>
        )}
      </div>
    </div>
  );
}

export function ParsonsQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const content = question.content;

  // Shuffle lines initially
  const shuffledLines = useMemo(
    () => [...content.codeLines].sort(() => Math.random() - 0.5),
    [content.codeLines]
  );

  const maxIndent = Math.max(...content.codeLines.map((l) => l.correctIndent));

  // Answer state: array of { id, indent }
  const [answer, setAnswer] = useState<LineAnswer[]>(
    (userAnswer as LineAnswer[]) ||
      shuffledLines.map((line) => ({ id: line.id, indent: 0 }))
  );

  useEffect(() => {
    if (userAnswer) {
      setAnswer(userAnswer as LineAnswer[]);
    }
  }, [userAnswer]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = answer.findIndex((a) => a.id === active.id);
      const newIndex = answer.findIndex((a) => a.id === over.id);
      const newAnswer = arrayMove(answer, oldIndex, newIndex);
      setAnswer(newAnswer);
      onAnswer(newAnswer);
    }
  };

  const handleIndentChange = (lineId: string, delta: number) => {
    const newAnswer = answer.map((a) =>
      a.id === lineId
        ? { ...a, indent: Math.max(0, Math.min(maxIndent, a.indent + delta)) }
        : a
    );
    setAnswer(newAnswer);
    onAnswer(newAnswer);
  };

  const getLineState = (lineId: string, index: number) => {
    if (!showResult) return "default";

    const line = content.codeLines.find((l) => l.id === lineId);
    const answerLine = answer.find((a) => a.id === lineId);

    if (!line || !answerLine) return "default";

    const positionCorrect = line.correctPosition === index;
    const indentCorrect = line.correctIndent === answerLine.indent;

    if (positionCorrect && indentCorrect) return "correct";
    if (positionCorrect && !indentCorrect) return "wrong-indent";
    return "incorrect";
  };

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <div className="text-lg text-white font-medium">{content.instruction}</div>

      {/* Language badge */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
          {content.language}
        </span>
        <span className="text-xs text-text-muted">
          Use arrows to adjust indentation
        </span>
      </div>

      {/* Parsons lines */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={answer.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 p-4 rounded-xl bg-[#0d1117] border border-surface-border">
            {answer.map((lineAnswer, index) => {
              const line = content.codeLines.find((l) => l.id === lineAnswer.id);
              if (!line) return null;

              return (
                <SortableLine
                  key={lineAnswer.id}
                  id={lineAnswer.id}
                  code={line.code}
                  indent={lineAnswer.indent}
                  maxIndent={maxIndent}
                  disabled={disabled}
                  state={getLineState(lineAnswer.id, index)}
                  onIndentChange={(delta) =>
                    handleIndentChange(lineAnswer.id, delta)
                  }
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Reset button */}
      {!disabled && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const reset = shuffledLines.map((line) => ({ id: line.id, indent: 0 }));
              setAnswer(reset);
              onAnswer(reset);
            }}
          >
            <Icon name="refresh" size="sm" className="mr-1" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
