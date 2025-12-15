// Question component props types

export interface BaseQuestionProps {
  question: {
    id: string;
    title: string;
    content: Record<string, unknown>;
    hints?: Array<{ id: string; text: string; xpPenalty: number; order: number }>;
    explanation?: string;
    timeLimit?: number | null;
    xpReward: number;
  };
  onAnswer: (answer: unknown) => void;
  disabled?: boolean;
  showResult?: boolean;
  userAnswer?: unknown;
  isCorrect?: boolean;
}

// Multiple Choice Content
export interface MultipleChoiceContent {
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  shuffleOptions: boolean;
}

// Multi Select Content
export interface MultiSelectContent {
  question: string;
  instruction?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  shuffleOptions: boolean;
  partialCredit: boolean;
}

// True/False Content
export interface TrueFalseContent {
  statement: string;
  isTrue: boolean;
}

// Fill in the Blank Content
export interface FillBlankContent {
  template: string;
  blanks: Array<{
    id: string;
    acceptedAnswers: string[];
    caseSensitive: boolean;
    placeholder?: string;
  }>;
  language?: string;
}

// Drag Order Content
export interface DragOrderContent {
  instruction: string;
  items: Array<{
    id: string;
    text: string;
    correctPosition: number;
  }>;
  includeDistractors: boolean;
  distractors?: Array<{
    id: string;
    text: string;
  }>;
}

// Drag Match Content
export interface DragMatchContent {
  instruction: string;
  leftItems: Array<{
    id: string;
    text: string;
    matchId: string;
  }>;
  rightItems: Array<{
    id: string;
    text: string;
  }>;
}

// Code Blocks Content
export interface DragCodeBlocksContent {
  instruction: string;
  language: string;
  blocks: Array<{
    id: string;
    code: string;
    correctPosition: number;
    indentLevel: number;
  }>;
  distractorBlocks?: Array<{
    id: string;
    code: string;
  }>;
}

// Parsons Content
export interface ParsonsContent {
  instruction: string;
  language: string;
  codeLines: Array<{
    id: string;
    code: string;
    correctPosition: number;
    correctIndent: number;
  }>;
}

// Code Writing Content
export interface CodeWritingContent {
  prompt: string;
  starterCode: string;
  language: string;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation?: string;
  }>;
  constraints?: string[];
  solutionCode?: string;
  allowedLanguages?: string[];
}

// Debugging Content
export interface DebuggingContent {
  prompt: string;
  buggyCode: string;
  language: string;
  bugs: Array<{
    lineNumber: number;
    bugDescription: string;
    correctCode: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}
