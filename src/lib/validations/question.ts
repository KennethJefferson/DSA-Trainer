import { z } from "zod";

// Enums
export const QuestionTypeEnum = z.enum([
  "multiple_choice",
  "multi_select",
  "fill_blank",
  "drag_order",
  "drag_match",
  "drag_code_blocks",
  "code_writing",
  "debugging",
  "true_false",
  "parsons",
]);

export const DifficultyEnum = z.enum([
  "beginner",
  "easy",
  "medium",
  "hard",
  "expert",
]);

// Hint schema
const hintSchema = z.object({
  id: z.string(),
  text: z.string(),
  xpPenalty: z.number().min(0).default(5),
  order: z.number().int().min(0),
});

// Base question schema
export const questionSchema = z.object({
  type: QuestionTypeEnum,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  difficulty: DifficultyEnum,
  topics: z.array(z.string()).min(1, "At least one topic is required"),
  tags: z.array(z.string()).default([]),
  xpReward: z.number().int().min(1).max(1000).default(10),
  timeLimit: z.number().int().positive().nullable().optional(),
  hints: z.array(hintSchema).default([]),
  explanation: z.string().optional(),
  content: z.record(z.any()), // Type-specific content, validated separately
  isPublic: z.boolean().default(false),
  metadata: z.record(z.any()).default({}),
});

export const createQuestionSchema = questionSchema;

export const updateQuestionSchema = questionSchema.partial();

export const questionFiltersSchema = z.object({
  type: QuestionTypeEnum.optional(),
  difficulty: DifficultyEnum.optional(),
  topic: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type QuestionType = z.infer<typeof QuestionTypeEnum>;
export type Difficulty = z.infer<typeof DifficultyEnum>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionFilters = z.infer<typeof questionFiltersSchema>;
