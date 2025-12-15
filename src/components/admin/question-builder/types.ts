import type { QuestionType, Difficulty } from "./constants";

export interface Hint {
  id: string;
  text: string;
  xpPenalty: number;
  order: number;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Blank {
  id: string;
  acceptedAnswers: string[];
  caseSensitive: boolean;
}

export interface DragItem {
  id: string;
  text: string;
  correctPosition: number;
}

export interface CodeLine {
  id: string;
  code: string;
  correctPosition: number;
  correctIndent: number;
}

export interface MatchItem {
  id: string;
  text: string;
  matchId?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface QuestionContent {
  // Multiple choice / Multi select
  question?: string;
  options?: Option[];
  shuffleOptions?: boolean;
  partialCredit?: boolean;

  // Fill blank
  template?: string;
  blanks?: Blank[];
  language?: string;

  // Drag order
  instruction?: string;
  items?: DragItem[];
  includeDistractors?: boolean;
  distractors?: DragItem[];

  // Drag match
  leftItems?: MatchItem[];
  rightItems?: MatchItem[];

  // Code blocks
  blocks?: CodeLine[];
  distractorBlocks?: CodeLine[];

  // Code writing / Debugging
  prompt?: string;
  starterCode?: string;
  buggyCode?: string;
  testCases?: TestCase[];
  constraints?: string[];
  bugs?: { id: string; description: string; line: number }[];

  // True/False
  statement?: string;
  isTrue?: boolean;

  // Parsons
  codeLines?: CodeLine[];
}

export interface QuestionFormData {
  id?: string;
  type: QuestionType;
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  tags: string[];
  xpReward: number;
  timeLimit: number | null;
  hints: Hint[];
  explanation: string;
  isPublic: boolean;
  content: QuestionContent;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  isValid: boolean;
}

export function getEmptyQuestion(type: QuestionType = "multiple_choice"): QuestionFormData {
  return {
    type,
    title: "",
    description: "",
    difficulty: "medium",
    topics: [],
    tags: [],
    xpReward: 10,
    timeLimit: null,
    hints: [],
    explanation: "",
    isPublic: false,
    content: getEmptyContent(type),
  };
}

export function getEmptyContent(type: QuestionType): QuestionContent {
  switch (type) {
    case "multiple_choice":
    case "multi_select":
      return {
        question: "",
        options: [
          { id: "opt-1", text: "", isCorrect: false },
          { id: "opt-2", text: "", isCorrect: false },
        ],
        shuffleOptions: true,
        ...(type === "multi_select" && { partialCredit: true }),
      };
    case "fill_blank":
      return { template: "", blanks: [], language: "javascript" };
    case "drag_order":
      return { instruction: "", items: [], includeDistractors: false, distractors: [] };
    case "drag_match":
      return { instruction: "", leftItems: [], rightItems: [] };
    case "drag_code_blocks":
      return { instruction: "", language: "javascript", blocks: [], distractorBlocks: [] };
    case "code_writing":
      return { prompt: "", starterCode: "", language: "javascript", testCases: [], constraints: [] };
    case "debugging":
      return { prompt: "", buggyCode: "", language: "javascript", bugs: [], testCases: [] };
    case "true_false":
      return { statement: "", isTrue: true };
    case "parsons":
      return { instruction: "", language: "javascript", codeLines: [] };
    default:
      return {};
  }
}
