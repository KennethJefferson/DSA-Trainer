"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import type { BaseQuestionProps, DragMatchContent } from "./types";

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: DragMatchContent;
  };
}

interface DraggableItemProps {
  id: string;
  text: string;
  disabled: boolean;
}

function DraggableItem({ id, text, disabled }: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      data-draggable-id={id}
      className={cn(
        "p-3 rounded-lg border-2 bg-surface border-surface-border text-sm text-text-main",
        "transition-all select-none",
        !disabled && "cursor-grab active:cursor-grabbing hover:border-primary/50",
        isDragging && "opacity-50"
      )}
    >
      {text}
    </div>
  );
}

interface DroppableSlotProps {
  leftItem: { id: string; text: string };
  matchedItem?: { id: string; text: string };
  state: "default" | "correct" | "incorrect";
  disabled: boolean;
  onRemove: () => void;
}

function DroppableSlot({
  leftItem,
  matchedItem,
  state,
  disabled,
  onRemove,
}: DroppableSlotProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2",
        state === "default" && "bg-surface/50 border-surface-border",
        state === "correct" && "bg-success/10 border-success",
        state === "incorrect" && "bg-error/10 border-error"
      )}
    >
      {/* Left item (fixed) */}
      <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm text-white font-medium">
        {leftItem.text}
      </div>

      {/* Arrow */}
      <Icon name="arrow_forward" size="sm" className="text-text-muted" />

      {/* Drop zone / matched item */}
      <div
        data-droppable-id={leftItem.id}
        className={cn(
          "flex-1 min-h-[48px] rounded-lg border-2 border-dashed flex items-center justify-center",
          !matchedItem && "border-surface-border bg-surface-light/30",
          matchedItem && state === "default" && "border-primary bg-primary/10",
          matchedItem && state === "correct" && "border-success bg-success/10",
          matchedItem && state === "incorrect" && "border-error bg-error/10"
        )}
      >
        {matchedItem ? (
          <div className="flex items-center gap-2 p-3 w-full">
            <span className="flex-1 text-sm text-text-main">{matchedItem.text}</span>
            {!disabled && (
              <button
                onClick={onRemove}
                className="p-1 rounded hover:bg-surface-light transition-colors"
              >
                <Icon name="close" size="sm" className="text-text-muted" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-text-muted">Drop here</span>
        )}
      </div>
    </div>
  );
}

export function DragMatchQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const content = question.content;

  // Matches: { leftItemId: rightItemId }
  const [matches, setMatches] = useState<Record<string, string>>(
    (userAnswer as Record<string, string>) || {}
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  // Shuffle right items
  const rightItems = useMemo(
    () => [...content.rightItems].sort(() => Math.random() - 0.5),
    [content.rightItems]
  );

  // Get unmatched right items
  const unmatchedRightItems = useMemo(
    () => rightItems.filter((item) => !Object.values(matches).includes(item.id)),
    [rightItems, matches]
  );

  useEffect(() => {
    if (userAnswer) {
      setMatches(userAnswer as Record<string, string>);
    }
  }, [userAnswer]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over) {
      const rightItemId = active.id as string;
      const leftItemId = over.id as string;

      // Check if dropping on a valid left item slot
      if (content.leftItems.find((item) => item.id === leftItemId)) {
        const newMatches = { ...matches };

        // Remove from previous slot if any
        Object.keys(newMatches).forEach((key) => {
          if (newMatches[key] === rightItemId) {
            delete newMatches[key];
          }
        });

        // Add to new slot
        newMatches[leftItemId] = rightItemId;
        setMatches(newMatches);
        onAnswer(newMatches);
      }
    }
  };

  const handleRemove = (leftItemId: string) => {
    const newMatches = { ...matches };
    delete newMatches[leftItemId];
    setMatches(newMatches);
    onAnswer(newMatches);
  };

  const getSlotState = (leftItemId: string) => {
    if (!showResult) return "default";

    const leftItem = content.leftItems.find((item) => item.id === leftItemId);
    const matchedRightId = matches[leftItemId];

    if (!matchedRightId) return "incorrect";
    return leftItem?.matchId === matchedRightId ? "correct" : "incorrect";
  };

  const activeItem = rightItems.find((item) => item.id === activeId);

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="text-lg text-white font-medium">{content.instruction}</div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matching slots */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-muted mb-2">
              Match the pairs
            </h4>
            {content.leftItems.map((leftItem) => {
              const matchedRightId = matches[leftItem.id];
              const matchedItem = rightItems.find((r) => r.id === matchedRightId);

              return (
                <DroppableSlot
                  key={leftItem.id}
                  leftItem={leftItem}
                  matchedItem={matchedItem}
                  state={getSlotState(leftItem.id)}
                  disabled={disabled}
                  onRemove={() => handleRemove(leftItem.id)}
                />
              );
            })}
          </div>

          {/* Available items to drag */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-muted mb-2">
              Available options
            </h4>
            <div className="p-4 rounded-xl bg-surface-light/30 border border-dashed border-surface-border min-h-[200px]">
              {unmatchedRightItems.length > 0 ? (
                <div className="space-y-2">
                  {unmatchedRightItems.map((item) => (
                    <DraggableItem
                      key={item.id}
                      id={item.id}
                      text={item.text}
                      disabled={disabled}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  All items matched!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="p-3 rounded-lg border-2 bg-primary/20 border-primary text-sm text-white shadow-lg">
              {activeItem.text}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
