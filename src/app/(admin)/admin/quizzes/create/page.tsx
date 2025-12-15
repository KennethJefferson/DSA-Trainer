"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Card, CardContent, Button, Input, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DIFFICULTIES, TOPICS } from "@/components/admin/question-builder";

interface Question {
  id: string;
  type: string;
  title: string;
  difficulty: string;
  topics: string[];
  xpReward: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Questions
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch("/api/questions?limit=500");
      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      setAvailableQuestions(data.questions || []);
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch =
      !questionSearch ||
      q.title.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesType = !questionTypeFilter || q.type === questionTypeFilter;
    return matchesSearch && matchesType;
  });

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newOrder = [...selectedQuestions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSelectedQuestions(newOrder);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error("Select at least one question");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          difficulty: difficulty || null,
          topics,
          isPublic,
          passingScore,
          timeLimit,
          questionIds: selectedQuestions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create quiz");
      }

      toast.success("Quiz created!");
      router.push("/admin/quizzes");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalXp = selectedQuestions.reduce((sum, id) => {
    const q = availableQuestions.find((q) => q.id === id);
    return sum + (q?.xpReward || 0);
  }, 0);

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Create Quiz"
        description="Build a new quiz by selecting questions"
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quiz Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="elevated">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Quiz Details</h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Arrays Fundamentals Quiz"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the quiz..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select difficulty</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Passing Score (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={passingScore}
                      onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Time Limit (sec)</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Optional"
                      value={timeLimit || ""}
                      onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.slice(0, 10).map((topic) => (
                      <button
                        key={topic}
                        onClick={() =>
                          setTopics((prev) =>
                            prev.includes(topic)
                              ? prev.filter((t) => t !== topic)
                              : [...prev, topic]
                          )
                        }
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium transition-all",
                          topics.includes(topic)
                            ? "bg-primary text-white"
                            : "bg-surface text-text-muted hover:bg-surface-light"
                        )}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-muted">Publish quiz</span>
                </label>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div className="p-3 rounded-lg bg-surface">
                    <p className="text-2xl font-bold text-primary">{selectedQuestions.length}</p>
                    <p className="text-xs text-text-muted">Questions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface">
                    <p className="text-2xl font-bold text-green-400">{totalXp}</p>
                    <p className="text-xs text-text-muted">Total XP</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!title.trim() || selectedQuestions.length === 0 || isSubmitting}
                  isLoading={isSubmitting}
                >
                  <Icon name="save" size="sm" className="mr-2" />
                  Create Quiz
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Question Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Questions */}
            <Card variant="elevated">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">
                  Selected Questions ({selectedQuestions.length})
                </h2>
              </div>
              <CardContent className="p-0">
                {selectedQuestions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon name="playlist_add" size="xl" className="text-text-muted mb-2 opacity-50" />
                    <p className="text-text-muted">Select questions from below</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {selectedQuestions.map((id, index) => {
                      const q = availableQuestions.find((q) => q.id === id);
                      if (!q) return null;
                      return (
                        <li key={id} className="flex items-center gap-4 p-4 hover:bg-white/5">
                          <span className="text-xs font-bold text-text-muted w-6 text-center">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{q.title}</p>
                            <p className="text-xs text-text-muted">
                              {q.type} • {q.difficulty} • {q.xpReward} XP
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(index, "up")}
                              disabled={index === 0}
                            >
                              <Icon name="arrow_upward" size="sm" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(index, "down")}
                              disabled={index === selectedQuestions.length - 1}
                            >
                              <Icon name="arrow_downward" size="sm" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuestion(id)}
                              className="text-red-500"
                            >
                              <Icon name="close" size="sm" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Available Questions */}
            <Card variant="elevated">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Available Questions</h2>
                </div>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search questions..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    icon={<Icon name="search" size="sm" />}
                    className="flex-1"
                  />
                  <select
                    value={questionTypeFilter}
                    onChange={(e) => setQuestionTypeFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-white"
                  >
                    <option value="">All Types</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="multi_select">Multi Select</option>
                    <option value="true_false">True/False</option>
                    <option value="fill_blank">Fill in Blank</option>
                    <option value="drag_order">Drag Order</option>
                    <option value="code_writing">Code Writing</option>
                  </select>
                </div>
              </div>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {isLoadingQuestions ? (
                  <div className="p-8 text-center">
                    <Icon name="progress_activity" className="animate-spin text-text-muted" />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon name="help_outline" size="xl" className="text-text-muted mb-2 opacity-50" />
                    <p className="text-text-muted">No questions found</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {filteredQuestions.map((q) => {
                      const isSelected = selectedQuestions.includes(q.id);
                      return (
                        <li
                          key={q.id}
                          onClick={() => toggleQuestion(q.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 cursor-pointer transition-colors",
                            isSelected
                              ? "bg-primary/10 border-l-4 border-primary"
                              : "hover:bg-white/5"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{q.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded text-xs bg-surface text-text-muted">
                                {q.type.replace("_", " ")}
                              </span>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-xs capitalize",
                                  q.difficulty === "beginner" && "bg-green-500/20 text-green-400",
                                  q.difficulty === "easy" && "bg-lime-500/20 text-lime-400",
                                  q.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                                  q.difficulty === "hard" && "bg-orange-500/20 text-orange-400",
                                  q.difficulty === "expert" && "bg-red-500/20 text-red-400"
                                )}
                              >
                                {q.difficulty}
                              </span>
                              <span className="text-xs text-primary">{q.xpReward} XP</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
