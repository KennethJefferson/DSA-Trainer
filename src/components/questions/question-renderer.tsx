"use client";

import { MultipleChoiceQuestion } from "./multiple-choice";
import { MultiSelectQuestion } from "./multi-select";
import { TrueFalseQuestion } from "./true-false";
import { FillBlankQuestion } from "./fill-blank";
import { DragOrderQuestion } from "./drag-order";
import { DragMatchQuestion } from "./drag-match";
import { DragCodeBlocksQuestion } from "./drag-code-blocks";
import { ParsonsQuestion } from "./parsons";
import { CodeWritingQuestion } from "./code-writing";
import { DebuggingQuestion } from "./debugging";
import type { BaseQuestionProps } from "./types";

interface QuestionRendererProps extends Omit<BaseQuestionProps, "question"> {
  question: BaseQuestionProps["question"] & {
    type: string;
  };
}

export function QuestionRenderer({
  question,
  onAnswer,
  disabled,
  showResult,
  userAnswer,
  isCorrect,
}: QuestionRendererProps) {
  const props = {
    question: question as any,
    onAnswer,
    disabled,
    showResult,
    userAnswer,
    isCorrect,
  };

  switch (question.type) {
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;

    case "multi_select":
      return <MultiSelectQuestion {...props} />;

    case "true_false":
      return <TrueFalseQuestion {...props} />;

    case "fill_blank":
      return <FillBlankQuestion {...props} />;

    case "drag_order":
      return <DragOrderQuestion {...props} />;

    case "drag_match":
      return <DragMatchQuestion {...props} />;

    case "drag_code_blocks":
      return <DragCodeBlocksQuestion {...props} />;

    case "parsons":
      return <ParsonsQuestion {...props} />;

    case "code_writing":
      return <CodeWritingQuestion {...props} />;

    case "debugging":
      return <DebuggingQuestion {...props} />;

    default:
      return (
        <div className="p-8 text-center text-text-muted">
          <p>Unknown question type: {question.type}</p>
        </div>
      );
  }
}
