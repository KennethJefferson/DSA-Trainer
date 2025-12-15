"use client";

import { createContext, useContext, useReducer, useCallback, useEffect } from "react";

// Types
interface Question {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  hints?: Array<{ id: string; text: string; xpPenalty: number; order: number }>;
  explanation?: string;
  timeLimit?: number | null;
  xpReward: number;
  difficulty: string;
}

interface QuizState {
  quizId: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, unknown>;
  hintsUsed: Record<string, string[]>; // questionId -> hintIds used
  timeRemaining: number | null; // seconds
  startedAt: Date;
  status: "in_progress" | "submitted" | "reviewing";
  results?: QuizResults;
}

interface QuizResults {
  score: number;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  timeSpent: number;
  questionResults: Array<{
    questionId: string;
    isCorrect: boolean;
    xpEarned: number;
    hintsUsed: number;
  }>;
}

type QuizAction =
  | { type: "SET_ANSWER"; questionId: string; answer: unknown }
  | { type: "USE_HINT"; questionId: string; hintId: string }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "GO_TO_QUESTION"; index: number }
  | { type: "TICK_TIMER" }
  | { type: "SUBMIT_QUIZ" }
  | { type: "SET_RESULTS"; results: QuizResults }
  | { type: "START_REVIEW" };

interface QuizContextValue {
  state: QuizState;
  currentQuestion: Question | null;
  setAnswer: (answer: unknown) => void;
  useHint: (hintId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  progress: number;
  answeredCount: number;
}

const QuizContext = createContext<QuizContextValue | null>(null);

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };

    case "USE_HINT": {
      const currentHints = state.hintsUsed[action.questionId] || [];
      if (currentHints.includes(action.hintId)) return state;
      return {
        ...state,
        hintsUsed: {
          ...state.hintsUsed,
          [action.questionId]: [...currentHints, action.hintId],
        },
      };
    }

    case "NEXT_QUESTION":
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
      };

    case "PREV_QUESTION":
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };

    case "GO_TO_QUESTION":
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(action.index, state.questions.length - 1)),
      };

    case "TICK_TIMER":
      if (state.timeRemaining === null || state.timeRemaining <= 0) return state;
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
      };

    case "SUBMIT_QUIZ":
      return {
        ...state,
        status: "submitted",
      };

    case "SET_RESULTS":
      return {
        ...state,
        results: action.results,
      };

    case "START_REVIEW":
      return {
        ...state,
        status: "reviewing",
        currentIndex: 0,
      };

    default:
      return state;
  }
}

interface QuizProviderProps {
  children: React.ReactNode;
  quizId: string;
  questions: Question[];
  timeLimit?: number | null;
}

export function QuizProvider({
  children,
  quizId,
  questions,
  timeLimit,
}: QuizProviderProps) {
  const [state, dispatch] = useReducer(quizReducer, {
    quizId,
    questions,
    currentIndex: 0,
    answers: {},
    hintsUsed: {},
    timeRemaining: timeLimit || null,
    startedAt: new Date(),
    status: "in_progress",
  });

  // Timer effect
  useEffect(() => {
    if (state.status !== "in_progress" || state.timeRemaining === null) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.timeRemaining]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (state.timeRemaining === 0 && state.status === "in_progress") {
      dispatch({ type: "SUBMIT_QUIZ" });
    }
  }, [state.timeRemaining, state.status]);

  const currentQuestion = state.questions[state.currentIndex] || null;

  const setAnswer = useCallback(
    (answer: unknown) => {
      if (!currentQuestion || state.status !== "in_progress") return;
      dispatch({ type: "SET_ANSWER", questionId: currentQuestion.id, answer });
    },
    [currentQuestion, state.status]
  );

  const useHint = useCallback(
    (hintId: string) => {
      if (!currentQuestion || state.status !== "in_progress") return;
      dispatch({ type: "USE_HINT", questionId: currentQuestion.id, hintId });
    },
    [currentQuestion, state.status]
  );

  const nextQuestion = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  const prevQuestion = useCallback(() => {
    dispatch({ type: "PREV_QUESTION" });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: "GO_TO_QUESTION", index });
  }, []);

  const submitQuiz = useCallback(() => {
    dispatch({ type: "SUBMIT_QUIZ" });
  }, []);

  const canGoNext = state.currentIndex < state.questions.length - 1;
  const canGoPrev = state.currentIndex > 0;
  const progress = ((state.currentIndex + 1) / state.questions.length) * 100;
  const answeredCount = Object.keys(state.answers).length;

  const value: QuizContextValue = {
    state,
    currentQuestion,
    setAnswer,
    useHint,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    canGoNext,
    canGoPrev,
    progress,
    answeredCount,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
