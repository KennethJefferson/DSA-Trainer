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
import type { BaseQuestionProps, DragOrderContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: DragOrderContent;
  };
}

interface SortableItemProps {
  id: string;
  text: string;
  index: number;
  disabled: boolean;
  state: "default" | "correct" | "incorrect";
}

function SortableItem({ id, text, index, disabled, state }: SortableItemProps) {
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
        "p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
        isDragging && "z-50 shadow-lg scale-105",
        state === "default" && "bg-surface border-surface-border",
        state === "correct" && "bg-success/10 border-success",
        state === "incorrect" && "bg-error/10 border-error",
        !disabled && "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      {/* Position number */}
      <span
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
          state === "default" && "bg-surface-light text-text-muted",
          state === "correct" && "bg-success text-white",
          state === "incorrect" && "bg-error text-white"
        )}
      >
        {index + 1}
      </span>

      {/* Item text */}
      <span className="flex-1 text-sm text-text-main">{text}</span>

      {/* Drag handle */}
      {!disabled && (
        <Icon name="drag_indicator" size="sm" className="text-text-muted" />
      )}
    </div>
  );
}

export function DragOrderQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const content = question.content;

  // Combine items and distractors, shuffle initially
  const allItems = useMemo(() => {
    const items = [...content.items];
    if (content.includeDistractors && content.distractors) {
      items.push(
        ...content.distractors.map((d) => ({
          ...d,
          correctPosition: -1, // Mark as distractor
        }))
      );
    }
    return items.sort(() => Math.random() - 0.5);
  }, [content.items, content.distractors, content.includeDistractors]);

  const [orderedIds, setOrderedIds] = useState<string[]>(
    (userAnswer as string[]) || allItems.map((item) => item.id)
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

  const getItemState = (itemId: string, index: number) => {
    if (!showResult) return "default";

    const item = allItems.find((i) => i.id === itemId);
    if (!item) return "default";

    // Distractor should not be in the answer
    if (item.correctPosition === -1) return "incorrect";

    return item.correctPosition === index ? "correct" : "incorrect";
  };

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <div className="text-lg text-white font-medium">{content.instruction}</div>

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {orderedIds.map((id, index) => {
              const item = allItems.find((i) => i.id === id);
              if (!item) return null;

              return (
                <SortableItem
                  key={id}
                  id={id}
                  text={item.text}
                  index={index}
                  disabled={disabled}
                  state={getItemState(id, index)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Instructions hint */}
      {!disabled && (
        <p className="text-xs text-text-muted text-center">
          Drag items to reorder them
        </p>
      )}
    </div>
  );
}
