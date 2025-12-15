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
import { Icon } from "@/components/ui";
import type { BaseQuestionProps, DragCodeBlocksContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: DragCodeBlocksContent;
  };
}

interface SortableCodeBlockProps {
  id: string;
  code: string;
  indentLevel: number;
  disabled: boolean;
  state: "default" | "correct" | "incorrect";
  isDistractor: boolean;
}

function SortableCodeBlock({
  id,
  code,
  indentLevel,
  disabled,
  state,
  isDistractor,
}: SortableCodeBlockProps) {
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
    marginLeft: `${indentLevel * 24}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 rounded-lg border-2 font-mono text-sm flex items-center gap-3 transition-all",
        isDragging && "z-50 shadow-lg scale-105",
        state === "default" && "bg-[#1e1e1e] border-surface-border text-gray-300",
        state === "correct" && "bg-success/10 border-success text-success",
        state === "incorrect" && "bg-error/10 border-error text-error",
        isDistractor && state === "incorrect" && "line-through opacity-75",
        !disabled && "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      {/* Drag handle */}
      {!disabled && (
        <Icon name="drag_indicator" size="sm" className="text-text-muted flex-shrink-0" />
      )}

      {/* Code */}
      <code className="flex-1 whitespace-pre">{code}</code>

      {/* Distractor indicator */}
      {showResult && isDistractor && (
        <span className="text-xs text-error">(extra)</span>
      )}
    </div>
  );
}

// Need to declare showResult in the component scope
let showResult = false;

export function DragCodeBlocksQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult: showResultProp = false,
  userAnswer,
}: Props) {
  showResult = showResultProp;
  const content = question.content;

  // Combine blocks and distractors
  const allBlocks = useMemo(() => {
    const blocks = content.blocks.map((b) => ({ ...b, isDistractor: false }));
    if (content.distractorBlocks) {
      blocks.push(
        ...content.distractorBlocks.map((d) => ({
          ...d,
          correctPosition: -1,
          indentLevel: 0,
          isDistractor: true,
        }))
      );
    }
    return blocks.sort(() => Math.random() - 0.5);
  }, [content.blocks, content.distractorBlocks]);

  const [orderedIds, setOrderedIds] = useState<string[]>(
    (userAnswer as string[]) || allBlocks.map((block) => block.id)
  );

  useEffect(() => {
    if (userAnswer) {
      setOrderedIds(userAnswer as string[]);
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
      const oldIndex = orderedIds.indexOf(active.id as string);
      const newIndex = orderedIds.indexOf(over.id as string);
      const newOrder = arrayMove(orderedIds, oldIndex, newIndex);
      setOrderedIds(newOrder);
      onAnswer(newOrder);
    }
  };

  const getBlockState = (blockId: string, index: number) => {
    if (!showResultProp) return "default";

    const block = allBlocks.find((b) => b.id === blockId);
    if (!block) return "default";

    // Distractor blocks are always wrong if included
    if (block.isDistractor) return "incorrect";

    return block.correctPosition === index ? "correct" : "incorrect";
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
      </div>

      {/* Code blocks */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 p-4 rounded-xl bg-[#0d1117] border border-surface-border">
            {orderedIds.map((id, index) => {
              const block = allBlocks.find((b) => b.id === id);
              if (!block) return null;

              return (
                <SortableCodeBlock
                  key={id}
                  id={id}
                  code={block.code}
                  indentLevel={block.indentLevel}
                  disabled={disabled}
                  state={getBlockState(id, index)}
                  isDistractor={block.isDistractor}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Instructions hint */}
      {!disabled && (
        <p className="text-xs text-text-muted text-center">
          Drag code blocks to arrange them in the correct order
        </p>
      )}
    </div>
  );
}
