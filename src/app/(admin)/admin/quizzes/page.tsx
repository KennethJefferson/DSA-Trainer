"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Card, CardContent, Button, Input, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DIFFICULTIES, TOPICS } from "@/components/admin/question-builder";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  topics: string[];
  isPublic: boolean;
  passingScore: number;
  timeLimit: number | null;
  _count: {
    questions: number;
    attempts: number;
  };
  createdAt: string;
}

export default function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "100");

      const response = await fetch(`/api/quizzes?${params}`);
      if (!response.ok) throw new Error("Failed to fetch quizzes");

      const data = await response.json();
      setQuizzes(data.quizzes || data);
    } catch (error) {
      toast.error("Failed to load quizzes");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const response = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete quiz");

      toast.success("Quiz deleted");
      fetchQuizzes();
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Quizzes"
        description={`${quizzes.length} quizzes in the database`}
        actions={
          <Link href="/admin/quizzes/create">
            <Button>
              <Icon name="add" size="sm" className="mr-2" />
              Create Quiz
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        {/* Search */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-4">
            <Input
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Icon name="search" size="sm" />}
            />
          </CardContent>
        </Card>

        {/* Quizzes Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Icon name="progress_activity" className="animate-spin text-text-muted" size="lg" />
          </div>
        ) : quizzes.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <Icon name="quiz" size="xl" className="text-text-muted mb-2 opacity-50" />
            <h3 className="text-lg font-medium text-white">No quizzes yet</h3>
            <p className="text-text-muted text-sm mt-1">Create your first quiz to get started.</p>
            <Link href="/admin/quizzes/create">
              <Button className="mt-4">Create Quiz</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} variant="elevated" className="group hover:border-primary/30 transition-colors">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    {quiz.isPublic ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400">
                        Draft
                      </span>
                    )}
                    {quiz.difficulty && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs capitalize",
                          quiz.difficulty === "beginner" && "bg-green-500/20 text-green-400",
                          quiz.difficulty === "easy" && "bg-lime-500/20 text-lime-400",
                          quiz.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                          quiz.difficulty === "hard" && "bg-orange-500/20 text-orange-400",
                          quiz.difficulty === "expert" && "bg-red-500/20 text-red-400"
                        )}
                      >
                        {quiz.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Topics */}
                  {quiz.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {quiz.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 rounded text-xs bg-surface text-text-muted"
                        >
                          {topic}
                        </span>
                      ))}
                      {quiz.topics.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-surface text-text-muted">
                          +{quiz.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <Icon name="help" size="sm" />
                      {quiz._count?.questions || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="play_arrow" size="sm" />
                      {quiz._count?.attempts || 0} attempts
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/admin/quizzes/${quiz.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Icon name="edit" size="sm" className="mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quiz.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Icon name="delete" size="sm" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
