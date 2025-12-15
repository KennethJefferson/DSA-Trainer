"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, Button, Input, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { QUESTION_TYPES, DIFFICULTIES, TOPICS, LANGUAGES } from "./constants";
import type { QuestionFormData, QuestionContent, ValidationResult } from "./types";
import { getEmptyQuestion, getEmptyContent } from "./types";
import { validateQuestion } from "./validation";

interface QuestionFormProps {
  initialData?: QuestionFormData;
  mode: "create" | "edit";
}

export function QuestionForm({ initialData, mode }: QuestionFormProps) {
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionFormData>(
    initialData || getEmptyQuestion()
  );
  const [validation, setValidation] = useState<ValidationResult>({
    errors: [],
    warnings: [],
    isValid: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update validation when question changes
  useEffect(() => {
    const result = validateQuestion(question);
    setValidation(result);
  }, [question]);

  const updateQuestion = useCallback((updates: Partial<QuestionFormData>) => {
    setQuestion((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateContent = useCallback((contentUpdates: Partial<QuestionContent>) => {
    setQuestion((prev) => ({
      ...prev,
      content: { ...prev.content, ...contentUpdates },
    }));
  }, []);

  const handleTypeChange = (newType: QuestionFormData["type"]) => {
    setQuestion((prev) => ({
      ...prev,
      type: newType,
      content: getEmptyContent(newType),
    }));
  };

  const handleSubmit = async () => {
    const result = validateQuestion(question);
    setValidation(result);

    if (!result.isValid) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = mode === "edit" && question.id
        ? `/api/questions/${question.id}`
        : "/api/questions";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: question.type,
          title: question.title,
          description: question.description || null,
          difficulty: question.difficulty,
          topics: question.topics,
          tags: question.tags,
          xpReward: question.xpReward,
          timeLimit: question.timeLimit,
          hints: question.hints,
          explanation: question.explanation || null,
          isPublic: question.isPublic,
          content: question.content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save question");
      }

      toast.success(mode === "edit" ? "Question updated!" : "Question created!");
      router.push("/admin/questions");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) =>
    validation.errors.find((e) => e.field === field)?.message;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Question Type Selection */}
        <Card variant="elevated">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Question Type</h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    question.type === type.value
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className={cn("size-8 rounded-lg flex items-center justify-center", type.color)}>
                    <Icon name={type.icon} className="text-white" size="sm" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight text-white">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card variant="elevated">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Basic Information</h2>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Title *</label>
              <Input
                value={question.title}
                onChange={(e) => updateQuestion({ title: e.target.value })}
                placeholder="e.g., Binary Search Implementation"
                error={getFieldError("title")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Description</label>
              <textarea
                value={question.description}
                onChange={(e) => updateQuestion({ description: e.target.value })}
                placeholder="Describe the question context..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Difficulty *</label>
                <select
                  value={question.difficulty}
                  onChange={(e) => updateQuestion({ difficulty: e.target.value as QuestionFormData["difficulty"] })}
                  className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">XP Reward</label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={question.xpReward}
                  onChange={(e) => updateQuestion({ xpReward: parseInt(e.target.value) || 10 })}
                  error={getFieldError("xpReward")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Topics *</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      const topics = question.topics.includes(topic)
                        ? question.topics.filter((t) => t !== topic)
                        : [...question.topics, topic];
                      updateQuestion({ topics });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      question.topics.includes(topic)
                        ? "bg-primary text-white"
                        : "bg-surface text-text-muted hover:bg-surface-light"
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {getFieldError("topics") && (
                <p className="text-xs text-red-500">{getFieldError("topics")}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Time Limit (seconds)</label>
              <Input
                type="number"
                min={0}
                placeholder="Optional - leave empty for no limit"
                value={question.timeLimit || ""}
                onChange={(e) => updateQuestion({
                  timeLimit: e.target.value ? parseInt(e.target.value) : null
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Type-Specific Content */}
        <Card variant="elevated">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon
                name={QUESTION_TYPES.find((t) => t.value === question.type)?.icon || "help"}
              />
              {QUESTION_TYPES.find((t) => t.value === question.type)?.label} Content
            </h2>
          </div>
          <CardContent className="p-6">
            <ContentEditor
              type={question.type}
              content={question.content}
              updateContent={updateContent}
              validation={validation}
            />
          </CardContent>
        </Card>

        {/* Hints & Explanation */}
        <Card variant="elevated">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="lightbulb" />
              Hints & Explanation
            </h2>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Hints</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateQuestion({
                      hints: [
                        ...question.hints,
                        {
                          id: `h-${Date.now()}`,
                          text: "",
                          xpPenalty: 5,
                          order: question.hints.length,
                        },
                      ],
                    })
                  }
                >
                  <Icon name="add" size="sm" className="mr-1" />
                  Add Hint
                </Button>
              </div>
              {question.hints.map((hint, idx) => (
                <div key={hint.id} className="flex gap-2 p-3 rounded-lg bg-surface">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-surface-light text-text-muted">
                    {idx + 1}
                  </span>
                  <Input
                    value={hint.text}
                    onChange={(e) => {
                      const hints = [...question.hints];
                      hints[idx].text = e.target.value;
                      updateQuestion({ hints });
                    }}
                    placeholder="Hint text..."
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={hint.xpPenalty}
                    onChange={(e) => {
                      const hints = [...question.hints];
                      hints[idx].xpPenalty = parseInt(e.target.value) || 0;
                      updateQuestion({ hints });
                    }}
                    className="w-20"
                    placeholder="XP"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateQuestion({
                        hints: question.hints.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500 hover:text-red-400"
                  >
                    <Icon name="delete" size="sm" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Explanation (shown after answering)
              </label>
              <textarea
                value={question.explanation}
                onChange={(e) => updateQuestion({ explanation: e.target.value })}
                placeholder="Explain the correct answer and common mistakes..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Validation Status */}
        <Card variant="elevated">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {validation.isValid ? (
                <Icon name="check_circle" className="text-green-500" />
              ) : (
                <Icon name="error" className="text-red-500" />
              )}
              Validation
            </h2>
          </div>
          <CardContent className="p-6 space-y-3">
            {validation.errors.length === 0 && validation.warnings.length === 0 ? (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <p className="text-sm font-medium">All checks passed!</p>
              </div>
            ) : (
              <>
                {validation.errors.map((error, i) => (
                  <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs text-red-500 flex items-center gap-2">
                      <Icon name="error" size="sm" />
                      {error.message}
                    </p>
                  </div>
                ))}
                {validation.warnings.map((warning, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs text-amber-500 flex items-center gap-2">
                      <Icon name="warning" size="sm" />
                      {warning.message}
                    </p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card variant="elevated">
          <CardContent className="p-6 space-y-3">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!validation.isValid || isSubmitting}
              isLoading={isSubmitting}
            >
              <Icon name="save" size="sm" className="mr-2" />
              {mode === "edit" ? "Update Question" : "Save Question"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/admin/questions")}
            >
              Cancel
            </Button>

            <div className="pt-3 border-t border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={question.isPublic}
                  onChange={(e) => updateQuestion({ isPublic: e.target.checked })}
                  className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-muted">Make public</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-surface">
                <p className="text-2xl font-bold text-primary">{question.xpReward}</p>
                <p className="text-xs text-text-muted">XP Reward</p>
              </div>
              <div className="p-3 rounded-lg bg-surface">
                <p className="text-2xl font-bold text-amber-400">{question.hints.length}</p>
                <p className="text-xs text-text-muted">Hints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Content Editor Component
function ContentEditor({
  type,
  content,
  updateContent,
  validation,
}: {
  type: QuestionFormData["type"];
  content: QuestionContent;
  updateContent: (updates: Partial<QuestionContent>) => void;
  validation: ValidationResult;
}) {
  const getFieldError = (field: string) =>
    validation.errors.find((e) => e.field === field)?.message;

  switch (type) {
    case "multiple_choice":
    case "multi_select":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Question Text</label>
            <textarea
              value={content.question || ""}
              onChange={(e) => updateContent({ question: e.target.value })}
              placeholder="What is the time complexity of binary search?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Options</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateContent({
                    options: [
                      ...(content.options || []),
                      { id: `opt-${Date.now()}`, text: "", isCorrect: false },
                    ],
                  })
                }
              >
                <Icon name="add" size="sm" className="mr-1" />
                Add Option
              </Button>
            </div>
            {content.options?.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2 p-3 rounded-lg bg-surface">
                <button
                  onClick={() => {
                    const options = content.options!.map((o, i) => ({
                      ...o,
                      isCorrect:
                        type === "multiple_choice"
                          ? i === idx
                          : i === idx
                          ? !o.isCorrect
                          : o.isCorrect,
                    }));
                    updateContent({ options });
                  }}
                  className={cn(
                    "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                    opt.isCorrect
                      ? "border-green-500 bg-green-500"
                      : "border-white/30"
                  )}
                >
                  {opt.isCorrect && <Icon name="check" className="text-white" size="sm" />}
                </button>
                <Input
                  value={opt.text}
                  onChange={(e) => {
                    const options = [...(content.options || [])];
                    options[idx].text = e.target.value;
                    updateContent({ options });
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateContent({
                      options: content.options?.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-red-500"
                  disabled={(content.options?.length || 0) <= 2}
                >
                  <Icon name="delete" size="sm" />
                </Button>
              </div>
            ))}
            {getFieldError("options") && (
              <p className="text-xs text-red-500">{getFieldError("options")}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.shuffleOptions || false}
                onChange={(e) => updateContent({ shuffleOptions: e.target.checked })}
                className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-muted">Shuffle options</span>
            </label>
            {type === "multi_select" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.partialCredit || false}
                  onChange={(e) => updateContent({ partialCredit: e.target.checked })}
                  className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-muted">Partial credit</span>
              </label>
            )}
          </div>
        </div>
      );

    case "true_false":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Statement</label>
            <textarea
              value={content.statement || ""}
              onChange={(e) => updateContent({ statement: e.target.value })}
              placeholder="A stack follows the LIFO (Last In, First Out) principle."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {getFieldError("statement") && (
              <p className="text-xs text-red-500">{getFieldError("statement")}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Correct Answer</label>
            <div className="flex gap-4">
              <button
                onClick={() => updateContent({ isTrue: true })}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 transition-all",
                  content.isTrue === true
                    ? "border-green-500 bg-green-500/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <Icon
                  name="check_circle"
                  size="lg"
                  className={cn("mx-auto mb-2", content.isTrue === true ? "text-green-500" : "text-text-muted")}
                />
                <p className="font-medium text-white">True</p>
              </button>
              <button
                onClick={() => updateContent({ isTrue: false })}
                className={cn(
                  "flex-1 p-4 rounded-xl border-2 transition-all",
                  content.isTrue === false
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <Icon
                  name="cancel"
                  size="lg"
                  className={cn("mx-auto mb-2", content.isTrue === false ? "text-red-500" : "text-text-muted")}
                />
                <p className="font-medium text-white">False</p>
              </button>
            </div>
          </div>
        </div>
      );

    case "fill_blank":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Language</label>
            <select
              value={content.language || "javascript"}
              onChange={(e) => updateContent({ language: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Template (use {"{{blank_id}}"} for blanks)
            </label>
            <textarea
              value={content.template || ""}
              onChange={(e) => updateContent({ template: e.target.value })}
              placeholder="for (int i = {{start}}; i < arr.{{prop}}; {{inc}}) {"
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
            />
            {getFieldError("template") && (
              <p className="text-xs text-red-500">{getFieldError("template")}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Blanks Definition</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateContent({
                    blanks: [
                      ...(content.blanks || []),
                      { id: `b${(content.blanks?.length || 0) + 1}`, acceptedAnswers: [], caseSensitive: false },
                    ],
                  })
                }
              >
                <Icon name="add" size="sm" className="mr-1" />
                Add Blank
              </Button>
            </div>
            {content.blanks?.map((blank, idx) => (
              <div key={blank.id} className="p-3 rounded-lg bg-surface space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={blank.id}
                    onChange={(e) => {
                      const blanks = [...(content.blanks || [])];
                      blanks[idx].id = e.target.value;
                      updateContent({ blanks });
                    }}
                    placeholder="ID"
                    className="w-24 font-mono"
                  />
                  <Input
                    value={blank.acceptedAnswers?.join(", ") || ""}
                    onChange={(e) => {
                      const blanks = [...(content.blanks || [])];
                      blanks[idx].acceptedAnswers = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      updateContent({ blanks });
                    }}
                    placeholder="Accepted answers (comma-separated)"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateContent({
                        blanks: content.blanks?.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500"
                  >
                    <Icon name="delete" size="sm" />
                  </Button>
                </div>
              </div>
            ))}
            {getFieldError("blanks") && (
              <p className="text-xs text-red-500">{getFieldError("blanks")}</p>
            )}
          </div>
        </div>
      );

    case "drag_order":
    case "parsons":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Instruction</label>
            <Input
              value={content.instruction || ""}
              onChange={(e) => updateContent({ instruction: e.target.value })}
              placeholder="Arrange the steps in the correct order..."
            />
          </div>

          {type === "parsons" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Language</label>
              <select
                value={content.language || "javascript"}
                onChange={(e) => updateContent({ language: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Items (in correct order)</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const items = type === "parsons" ? content.codeLines || [] : content.items || [];
                  const newItem = type === "parsons"
                    ? { id: `l-${Date.now()}`, code: "", correctPosition: items.length, correctIndent: 0 }
                    : { id: `i-${Date.now()}`, text: "", correctPosition: items.length };
                  updateContent(type === "parsons" ? { codeLines: [...items, newItem] } : { items: [...items, newItem] });
                }}
              >
                <Icon name="add" size="sm" className="mr-1" />
                Add Item
              </Button>
            </div>
            {(type === "parsons" ? content.codeLines : content.items)?.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface">
                <Icon name="drag_indicator" className="text-text-muted" size="sm" />
                <span className="text-xs font-bold w-6 text-center text-text-muted">{idx + 1}</span>
                <Input
                  value={"text" in item ? item.text : item.code || ""}
                  onChange={(e) => {
                    const key = type === "parsons" ? "codeLines" : "items";
                    const items = [...((type === "parsons" ? content.codeLines : content.items) || [])];
                    if (type === "parsons") {
                      (items[idx] as typeof content.codeLines[0]).code = e.target.value;
                    } else {
                      (items[idx] as typeof content.items[0]).text = e.target.value;
                    }
                    updateContent({ [key]: items });
                  }}
                  placeholder={type === "parsons" ? "Code line..." : "Step description..."}
                  className={cn("flex-1", type === "parsons" && "font-mono")}
                />
                {type === "parsons" && (
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={(item as typeof content.codeLines[0]).correctIndent || 0}
                    onChange={(e) => {
                      const items = [...(content.codeLines || [])];
                      items[idx].correctIndent = parseInt(e.target.value) || 0;
                      updateContent({ codeLines: items });
                    }}
                    className="w-16"
                    title="Indent level"
                  />
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const key = type === "parsons" ? "codeLines" : "items";
                    updateContent({
                      [key]: (type === "parsons" ? content.codeLines : content.items)?.filter((_, i) => i !== idx),
                    });
                  }}
                  className="text-red-500"
                >
                  <Icon name="delete" size="sm" />
                </Button>
              </div>
            ))}
            {(getFieldError("items") || getFieldError("codeLines")) && (
              <p className="text-xs text-red-500">{getFieldError("items") || getFieldError("codeLines")}</p>
            )}
          </div>
        </div>
      );

    case "code_writing":
    case "debugging":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Prompt</label>
            <textarea
              value={content.prompt || ""}
              onChange={(e) => updateContent({ prompt: e.target.value })}
              placeholder="Write a function that reverses a linked list..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {getFieldError("prompt") && (
              <p className="text-xs text-red-500">{getFieldError("prompt")}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Language</label>
            <select
              value={content.language || "javascript"}
              onChange={(e) => updateContent({ language: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {type === "debugging" ? "Buggy Code" : "Starter Code"}
            </label>
            <textarea
              value={type === "debugging" ? content.buggyCode : content.starterCode || ""}
              onChange={(e) =>
                updateContent(
                  type === "debugging"
                    ? { buggyCode: e.target.value }
                    : { starterCode: e.target.value }
                )
              }
              placeholder="function solution(input) {&#10;  // Your code here&#10;}"
              rows={8}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
            />
            {getFieldError("buggyCode") && (
              <p className="text-xs text-red-500">{getFieldError("buggyCode")}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Test Cases</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateContent({
                    testCases: [
                      ...(content.testCases || []),
                      { id: `tc-${Date.now()}`, input: "", expectedOutput: "", isHidden: false },
                    ],
                  })
                }
              >
                <Icon name="add" size="sm" className="mr-1" />
                Add Test
              </Button>
            </div>
            {content.testCases?.map((tc, idx) => (
              <div key={tc.id} className="p-3 rounded-lg bg-surface space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-muted">#{idx + 1}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="checkbox"
                      checked={tc.isHidden || false}
                      onChange={(e) => {
                        const tests = [...(content.testCases || [])];
                        tests[idx].isHidden = e.target.checked;
                        updateContent({ testCases: tests });
                      }}
                      className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-text-muted">Hidden</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateContent({
                        testCases: content.testCases?.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500"
                  >
                    <Icon name="delete" size="sm" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={tc.input}
                    onChange={(e) => {
                      const tests = [...(content.testCases || [])];
                      tests[idx].input = e.target.value;
                      updateContent({ testCases: tests });
                    }}
                    placeholder="Input: [1,2,3]"
                    className="font-mono text-xs"
                  />
                  <Input
                    value={tc.expectedOutput}
                    onChange={(e) => {
                      const tests = [...(content.testCases || [])];
                      tests[idx].expectedOutput = e.target.value;
                      updateContent({ testCases: tests });
                    }}
                    placeholder="Expected: [3,2,1]"
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            ))}
            {getFieldError("testCases") && (
              <p className="text-xs text-red-500">{getFieldError("testCases")}</p>
            )}
          </div>
        </div>
      );

    case "drag_match":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Instruction</label>
            <Input
              value={content.instruction || ""}
              onChange={(e) => updateContent({ instruction: e.target.value })}
              placeholder="Match each data structure with its use case..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Left Items</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateContent({
                      leftItems: [...(content.leftItems || []), { id: `l-${Date.now()}`, text: "" }],
                    })
                  }
                >
                  <Icon name="add" size="sm" />
                </Button>
              </div>
              {content.leftItems?.map((item, idx) => (
                <div key={item.id} className="flex gap-2 p-2 rounded bg-surface">
                  <Input
                    value={item.text}
                    onChange={(e) => {
                      const items = [...(content.leftItems || [])];
                      items[idx].text = e.target.value;
                      updateContent({ leftItems: items });
                    }}
                    placeholder="Left item..."
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateContent({
                        leftItems: content.leftItems?.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500"
                  >
                    <Icon name="close" size="sm" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Right Items</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateContent({
                      rightItems: [...(content.rightItems || []), { id: `r-${Date.now()}`, text: "" }],
                    })
                  }
                >
                  <Icon name="add" size="sm" />
                </Button>
              </div>
              {content.rightItems?.map((item, idx) => (
                <div key={item.id} className="flex gap-2 p-2 rounded bg-surface">
                  <Input
                    value={item.text}
                    onChange={(e) => {
                      const items = [...(content.rightItems || [])];
                      items[idx].text = e.target.value;
                      updateContent({ rightItems: items });
                    }}
                    placeholder="Right item..."
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateContent({
                        rightItems: content.rightItems?.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500"
                  >
                    <Icon name="close" size="sm" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Tip: Items at the same index will be matched. Add extra right items as distractors.
          </p>
          {getFieldError("items") && (
            <p className="text-xs text-red-500">{getFieldError("items")}</p>
          )}
        </div>
      );

    case "drag_code_blocks":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Instruction</label>
            <Input
              value={content.instruction || ""}
              onChange={(e) => updateContent({ instruction: e.target.value })}
              placeholder="Arrange the code blocks to form a valid function..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Language</label>
            <select
              value={content.language || "javascript"}
              onChange={(e) => updateContent({ language: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Code Blocks (in correct order)</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateContent({
                    blocks: [
                      ...(content.blocks || []),
                      { id: `b-${Date.now()}`, code: "", correctPosition: content.blocks?.length || 0, correctIndent: 0 },
                    ],
                  })
                }
              >
                <Icon name="add" size="sm" className="mr-1" />
                Add Block
              </Button>
            </div>
            {content.blocks?.map((block, idx) => (
              <div key={block.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface">
                <Icon name="drag_indicator" className="text-text-muted" size="sm" />
                <span className="text-xs font-bold w-6 text-center text-text-muted">{idx + 1}</span>
                <Input
                  value={block.code}
                  onChange={(e) => {
                    const blocks = [...(content.blocks || [])];
                    blocks[idx].code = e.target.value;
                    updateContent({ blocks });
                  }}
                  placeholder="Code block..."
                  className="flex-1 font-mono"
                />
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={block.correctIndent || 0}
                  onChange={(e) => {
                    const blocks = [...(content.blocks || [])];
                    blocks[idx].correctIndent = parseInt(e.target.value) || 0;
                    updateContent({ blocks });
                  }}
                  className="w-16"
                  title="Indent level"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateContent({
                      blocks: content.blocks?.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-red-500"
                >
                  <Icon name="delete" size="sm" />
                </Button>
              </div>
            ))}
            {getFieldError("blocks") && (
              <p className="text-xs text-red-500">{getFieldError("blocks")}</p>
            )}
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-text-muted">
          Select a question type to configure content.
        </p>
      );
  }
}
