import type { QuestionFormData, ValidationResult, ValidationError } from "./types";

export function validateQuestion(question: QuestionFormData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Base validations
  if (!question.title?.trim()) {
    errors.push({ field: "title", message: "Title is required" });
  }
  if (question.title?.length > 200) {
    errors.push({ field: "title", message: "Title must be under 200 characters" });
  }
  if (!question.type) {
    errors.push({ field: "type", message: "Question type is required" });
  }
  if (!question.difficulty) {
    errors.push({ field: "difficulty", message: "Difficulty is required" });
  }
  if (!question.topics?.length) {
    errors.push({ field: "topics", message: "At least one topic is required" });
  }
  if (question.xpReward < 1 || question.xpReward > 1000) {
    errors.push({ field: "xpReward", message: "XP reward must be between 1 and 1000" });
  }

  // Warnings (non-blocking)
  if (!question.description?.trim()) {
    warnings.push({ field: "description", message: "Description is recommended" });
  }
  if (!question.explanation?.trim()) {
    warnings.push({ field: "explanation", message: "Explanation is recommended for learning" });
  }

  // Type-specific validations
  switch (question.type) {
    case "multiple_choice":
    case "multi_select": {
      const options = question.content?.options || [];
      if (options.length < 2) {
        errors.push({ field: "options", message: "At least 2 options are required" });
      } else {
        const correctCount = options.filter(o => o.isCorrect).length;
        if (correctCount === 0) {
          errors.push({ field: "options", message: "At least one correct answer is required" });
        }
        if (question.type === "multiple_choice" && correctCount > 1) {
          errors.push({ field: "options", message: "Multiple choice should have exactly one correct answer" });
        }
        if (question.type === "multi_select" && correctCount < 2) {
          warnings.push({ field: "options", message: "Multi-select typically has multiple correct answers" });
        }
        if (options.some(o => !o.text?.trim())) {
          errors.push({ field: "options", message: "All options must have text" });
        }
      }
      break;
    }

    case "fill_blank": {
      const template = question.content?.template || "";
      if (!template.trim()) {
        errors.push({ field: "template", message: "Template is required" });
      } else {
        const blankMatches = template.match(/\{\{(\w+)\}\}/g) || [];
        const blankIds = blankMatches.map(m => m.replace(/[{}]/g, ""));
        const definedBlanks = question.content?.blanks?.map(b => b.id) || [];

        blankIds.forEach(id => {
          if (!definedBlanks.includes(id)) {
            errors.push({ field: "blanks", message: `Blank "{{${id}}}" is not defined` });
          }
        });

        question.content?.blanks?.forEach(blank => {
          if (!blank.acceptedAnswers?.length) {
            errors.push({ field: "blanks", message: `Blank "${blank.id}" needs at least one accepted answer` });
          }
        });
      }
      break;
    }

    case "drag_order": {
      const items = question.content?.items || [];
      if (items.length < 2) {
        errors.push({ field: "items", message: "At least 2 items are required" });
      }
      if (items.some(i => !i.text?.trim())) {
        errors.push({ field: "items", message: "All items must have text" });
      }
      break;
    }

    case "drag_match": {
      const leftItems = question.content?.leftItems || [];
      const rightItems = question.content?.rightItems || [];
      if (leftItems.length < 2 || rightItems.length < 2) {
        errors.push({ field: "items", message: "At least 2 items on each side are required" });
      }
      if (leftItems.some(i => !i.text?.trim()) || rightItems.some(i => !i.text?.trim())) {
        errors.push({ field: "items", message: "All items must have text" });
      }
      break;
    }

    case "drag_code_blocks": {
      const blocks = question.content?.blocks || [];
      if (blocks.length < 2) {
        errors.push({ field: "blocks", message: "At least 2 code blocks are required" });
      }
      if (blocks.some(b => !b.code?.trim())) {
        errors.push({ field: "blocks", message: "All blocks must have code" });
      }
      break;
    }

    case "parsons": {
      const codeLines = question.content?.codeLines || [];
      if (codeLines.length < 2) {
        errors.push({ field: "codeLines", message: "At least 2 code lines are required" });
      }
      if (codeLines.some(l => !l.code?.trim())) {
        errors.push({ field: "codeLines", message: "All lines must have code" });
      }
      break;
    }

    case "code_writing":
    case "debugging": {
      if (!question.content?.prompt?.trim()) {
        errors.push({ field: "prompt", message: "Problem prompt is required" });
      }
      if (!question.content?.testCases?.length) {
        errors.push({ field: "testCases", message: "At least one test case is required" });
      }
      if (!question.content?.language) {
        errors.push({ field: "language", message: "Programming language is required" });
      }
      if (question.type === "debugging" && !question.content?.buggyCode?.trim()) {
        errors.push({ field: "buggyCode", message: "Buggy code is required for debugging questions" });
      }
      break;
    }

    case "true_false": {
      if (!question.content?.statement?.trim()) {
        errors.push({ field: "statement", message: "Statement is required" });
      }
      if (question.content?.isTrue === undefined) {
        errors.push({ field: "isTrue", message: "Correct answer must be specified" });
      }
      break;
    }
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}
