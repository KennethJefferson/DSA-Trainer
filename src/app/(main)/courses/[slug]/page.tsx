"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  timeLimit: number | null;
  passingScore: number;
  questionCount: number;
  progress: {
    completed: boolean;
    bestScore: number;
    attempts: number;
  } | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  progress: {
    completed: boolean;
    score: number;
    xpEarned: number;
  } | null;
  quizzes: Quiz[];
}

interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: string;
  topics: string[];
  estimatedHours: number;
  modules: Module[];
  progress: {
    completedModules: number;
    totalModules: number;
    percentComplete: number;
    totalXpEarned: number;
  } | null;
}

// Demo course detail data
const getDemoCourse = (slug: string): CourseDetail | null => {
  const courses: Record<string, CourseDetail> = {
    "arrays-fundamentals": {
      id: "demo-1",
      slug: "arrays-fundamentals",
      title: "Arrays & Strings Fundamentals",
      description: "Master the basics of array manipulation and string processing. Learn essential techniques like two pointers, sliding window, and prefix sums that form the foundation of many DSA problems.",
      thumbnail: null,
      difficulty: "beginner",
      topics: ["Arrays", "Strings", "Two Pointers", "Sliding Window"],
      estimatedHours: 8,
      modules: [
        {
          id: "m1",
          title: "Array Basics",
          description: "Learn fundamental array operations, traversal patterns, and common manipulation techniques.",
          order: 1,
          progress: null,
          quizzes: [
            { id: "q1", title: "Array Traversal", description: "Practice different ways to iterate through arrays", difficulty: "beginner", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q2", title: "Array Modification", description: "Learn to insert, delete, and update array elements", difficulty: "beginner", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q3", title: "Array Searching", description: "Basic searching techniques in arrays", difficulty: "easy", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
          ],
        },
        {
          id: "m2",
          title: "String Manipulation",
          description: "Master string operations, pattern matching, and common string algorithms.",
          order: 2,
          progress: null,
          quizzes: [
            { id: "q4", title: "String Basics", description: "Fundamental string operations", difficulty: "beginner", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q5", title: "String Patterns", description: "Common string manipulation patterns", difficulty: "easy", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q6", title: "Anagrams & Palindromes", description: "Solve classic string problems", difficulty: "easy", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
          ],
        },
        {
          id: "m3",
          title: "Two Pointers Technique",
          description: "Learn the powerful two pointers pattern for efficient array/string problems.",
          order: 3,
          progress: null,
          quizzes: [
            { id: "q7", title: "Two Pointers Basics", description: "Introduction to two pointers technique", difficulty: "easy", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q8", title: "Pair Problems", description: "Solve pair-finding problems efficiently", difficulty: "medium", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q9", title: "Three Sum", description: "Apply two pointers to three sum variations", difficulty: "medium", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
          ],
        },
        {
          id: "m4",
          title: "Sliding Window",
          description: "Master the sliding window technique for subarray and substring problems.",
          order: 4,
          progress: null,
          quizzes: [
            { id: "q10", title: "Fixed Window", description: "Fixed-size sliding window problems", difficulty: "easy", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q11", title: "Variable Window", description: "Dynamic sliding window problems", difficulty: "medium", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
            { id: "q12", title: "Window Optimization", description: "Advanced window techniques", difficulty: "medium", timeLimit: 300, passingScore: 70, questionCount: 5, progress: null },
          ],
        },
      ],
      progress: null,
    },
  };

  return courses[slug] || null;
};

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const response = await fetch(`/api/courses/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
          // Expand first module by default
          if (data.modules?.length > 0) {
            setExpandedModules(new Set([data.modules[0].id]));
          }
        } else {
          // Use demo data
          const demo = getDemoCourse(slug);
          setCourse(demo);
          if (demo?.modules?.length) {
            setExpandedModules(new Set([demo.modules[0].id]));
          }
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
        const demo = getDemoCourse(slug);
        setCourse(demo);
        if (demo?.modules?.length) {
          setExpandedModules(new Set([demo.modules[0].id]));
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "text-green-400";
      case "easy": return "text-blue-400";
      case "medium": return "text-yellow-400";
      case "hard": return "text-orange-400";
      case "expert": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-[1600px] mx-auto w-full">
        <Card variant="elevated" className="text-center py-16">
          <Icon name="error" size="xl" className="text-error mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Course Not Found</h2>
          <p className="text-text-muted mb-4">
            The course you're looking for doesn't exist.
          </p>
          <Link href="/courses">
            <Button>
              <Icon name="arrow_back" size="sm" className="mr-2" />
              Back to Courses
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalQuizzes = course.modules.reduce((sum, m) => sum + m.quizzes.length, 0);
  const completedQuizzes = course.modules.reduce(
    (sum, m) => sum + m.quizzes.filter((q) => q.progress?.completed).length,
    0
  );

  return (
    <div className="max-w-[1600px] mx-auto w-full">
      {/* Back Button */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-text-muted hover:text-white mb-6 transition-colors"
      >
        <Icon name="arrow_back" size="sm" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <Card variant="elevated" className="!p-0 mb-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Thumbnail */}
          <div className="relative h-48 lg:h-auto bg-gradient-to-br from-primary/20 to-purple-500/20">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="school" className="text-8xl text-white/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={cn("text-sm font-medium", getDifficultyColor(course.difficulty))}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-sm text-text-muted">{course.estimatedHours}h estimated</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
            <p className="text-text-muted mb-6">{course.description}</p>

            {/* Topics */}
            <div className="flex flex-wrap gap-2 mb-6">
              {course.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-2xl font-bold text-white">{course.modules.length}</p>
                <p className="text-sm text-text-muted">Modules</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalQuizzes}</p>
                <p className="text-sm text-text-muted">Quizzes</p>
              </div>
              {course.progress && (
                <>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {course.progress.percentComplete}%
                    </p>
                    <p className="text-sm text-text-muted">Complete</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {course.progress.totalXpEarned}
                    </p>
                    <p className="text-sm text-text-muted">XP Earned</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {course.progress && (
          <div className="h-2 bg-surface">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${course.progress.percentComplete}%` }}
            />
          </div>
        )}
      </Card>

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Course Curriculum</h2>

        {course.modules.map((module) => (
          <Card
            key={module.id}
            variant="elevated"
            className={cn(
              "!p-0 overflow-hidden transition-all",
              module.progress?.completed && "border-success/50"
            )}
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-surface-light/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                    module.progress?.completed
                      ? "bg-success/20 text-success"
                      : "bg-surface-light text-text-muted"
                  )}
                >
                  {module.progress?.completed ? (
                    <Icon name="check" />
                  ) : (
                    module.order
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{module.title}</h3>
                  <p className="text-sm text-text-muted">
                    {module.quizzes.length} quizzes
                    {module.progress && ` • ${module.progress.xpEarned} XP earned`}
                  </p>
                </div>
              </div>
              <Icon
                name={expandedModules.has(module.id) ? "expand_less" : "expand_more"}
                className="text-text-muted"
              />
            </button>

            {/* Module Content */}
            {expandedModules.has(module.id) && (
              <div className="border-t border-surface-border">
                {module.description && (
                  <p className="px-4 py-3 text-sm text-text-muted bg-surface-light/30">
                    {module.description}
                  </p>
                )}

                {/* Quizzes */}
                <div className="divide-y divide-surface-border">
                  {module.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-surface-light/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            quiz.progress?.completed
                              ? "bg-success/20 text-success"
                              : "bg-surface-light text-text-muted"
                          )}
                        >
                          {quiz.progress?.completed ? (
                            <Icon name="check" size="sm" />
                          ) : (
                            <Icon name="quiz" size="sm" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{quiz.title}</p>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className={getDifficultyColor(quiz.difficulty)}>
                              {quiz.difficulty}
                            </span>
                            <span>•</span>
                            <span>{quiz.questionCount} questions</span>
                            {quiz.timeLimit && (
                              <>
                                <span>•</span>
                                <span>{Math.floor(quiz.timeLimit / 60)}min</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {quiz.progress && (
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium text-white">
                              Best: {quiz.progress.bestScore}%
                            </p>
                            <p className="text-xs text-text-muted">
                              {quiz.progress.attempts} attempt{quiz.progress.attempts !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                        <Link href={`/quiz/${quiz.id}`}>
                          <Button size="sm" variant={quiz.progress?.completed ? "outline" : "primary"}>
                            {quiz.progress?.completed ? "Retry" : "Start"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
