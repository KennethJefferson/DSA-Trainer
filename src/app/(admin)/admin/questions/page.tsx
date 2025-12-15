"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Card, CardContent, Button, Input, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { QUESTION_TYPES, DIFFICULTIES, TOPICS } from "@/components/admin/question-builder";

interface Question {
  id: string;
  type: string;
  title: string;
  difficulty: string;
  topics: string[];
  xpReward: number;
  isPublic: boolean;
  createdAt: string;
}

export default function QuestionsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get("difficulty") || "");
  const [topicFilter, setTopicFilter] = useState(searchParams.get("topic") || "");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(searchParams.get("action") === "import");
  const [importData, setImportData] = useState("");

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      if (topicFilter) params.set("topic", topicFilter);
      params.set("page", page.toString());
      params.set("limit", pageSize.toString());

      const response = await fetch(`/api/questions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      setQuestions(data.questions);
      setTotal(data.total);
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, difficultyFilter, topicFilter, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete question");

      toast.success("Question deleted");
      fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} questions?`)) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/questions/${id}`, { method: "DELETE" })
        )
      );
      toast.success(`Deleted ${selectedIds.size} questions`);
      setSelectedIds(new Set());
      fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete some questions");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      if (topicFilter) params.set("topic", topicFilter);
      params.set("limit", "1000");

      const response = await fetch(`/api/questions?${params}`);
      if (!response.ok) throw new Error("Failed to export");

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data.questions, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `questions-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Questions exported!");
    } catch (error) {
      toast.error("Failed to export questions");
    }
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importData);
      const questions = Array.isArray(parsed) ? parsed : [parsed];

      let success = 0;
      let failed = 0;

      for (const q of questions) {
        try {
          const response = await fetch("/api/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
          });
          if (response.ok) success++;
          else failed++;
        } catch {
          failed++;
        }
      }

      toast.success(`Imported ${success} questions${failed > 0 ? `, ${failed} failed` : ""}`);
      setShowImportModal(false);
      setImportData("");
      fetchQuestions();
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const typeLabels: Record<string, string> = Object.fromEntries(
    QUESTION_TYPES.map((t) => [t.value, t.label])
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Questions"
        description={`${total} questions in the database`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Icon name="upload" size="sm" className="mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Icon name="download" size="sm" className="mr-2" />
              Export
            </Button>
            <Link href="/admin/questions/create">
              <Button>
                <Icon name="add" size="sm" className="mr-2" />
                Create Question
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8">
        {/* Filters */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Icon name="search" size="sm" />}
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-white"
              >
                <option value="">All Types</option>
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-white"
              >
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-white"
              >
                <option value="">All Topics</option>
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
            <span className="text-sm text-white">
              {selectedIds.size} question{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                isLoading={isDeleting}
              >
                <Icon name="delete" size="sm" className="mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Questions Table */}
        <Card variant="elevated">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === questions.length && questions.length > 0}
                      onChange={selectAll}
                      className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Title</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Type</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Difficulty</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Topics</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">XP</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Status</th>
                  <th className="p-4 text-right text-sm font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Icon name="progress_activity" className="animate-spin text-text-muted" />
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Icon name="help_outline" size="xl" className="text-text-muted mb-2 opacity-50" />
                      <p className="text-text-muted">No questions found</p>
                      <Link
                        href="/admin/questions/create"
                        className="text-primary hover:text-primary-hover text-sm mt-2 inline-block"
                      >
                        Create your first question
                      </Link>
                    </td>
                  </tr>
                ) : (
                  questions.map((question) => (
                    <tr key={question.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(question.id)}
                          onChange={() => toggleSelect(question.id)}
                          className="rounded border-white/20 bg-surface text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/questions/${question.id}`}
                          className="text-white hover:text-primary font-medium"
                        >
                          {question.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs bg-surface text-text-muted">
                          {typeLabels[question.type] || question.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs capitalize",
                            question.difficulty === "beginner" && "bg-green-500/20 text-green-400",
                            question.difficulty === "easy" && "bg-lime-500/20 text-lime-400",
                            question.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                            question.difficulty === "hard" && "bg-orange-500/20 text-orange-400",
                            question.difficulty === "expert" && "bg-red-500/20 text-red-400"
                          )}
                        >
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {question.topics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-0.5 rounded text-xs bg-surface text-text-muted"
                            >
                              {topic}
                            </span>
                          ))}
                          {question.topics.length > 2 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-surface text-text-muted">
                              +{question.topics.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-primary font-medium">{question.xpReward}</td>
                      <td className="p-4">
                        {question.isPublic ? (
                          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                            Public
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/questions/${question.id}`}>
                            <Button variant="ghost" size="sm">
                              <Icon name="edit" size="sm" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Icon name="delete" size="sm" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="elevated" className="w-full max-w-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Import Questions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImportModal(false)}
              >
                <Icon name="close" size="sm" />
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-text-muted">
                Paste a JSON array of questions or a single question object.
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={`[\n  {\n    "type": "multiple_choice",\n    "title": "Question Title",\n    ...\n  }\n]`}
                rows={12}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!importData.trim()}>
                  <Icon name="upload" size="sm" className="mr-2" />
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
