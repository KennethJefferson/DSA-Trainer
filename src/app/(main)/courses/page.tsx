"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Button, Icon, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

interface CourseModule {
  id: string;
  title: string;
  order: number;
  quizCount: number;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: string;
  topics: string[];
  estimatedHours: number;
  totalModules: number;
  totalQuizzes: number;
  modules: CourseModule[];
  progress: {
    completedModules: number;
    totalXp: number;
    percentComplete: number;
  } | null;
}

// Demo courses data (used when no courses exist in database)
const demoCourses: Course[] = [
  {
    id: "demo-1",
    slug: "arrays-fundamentals",
    title: "Arrays & Strings Fundamentals",
    description: "Master the basics of array manipulation and string processing. Learn essential techniques like two pointers, sliding window, and prefix sums.",
    thumbnail: null,
    difficulty: "beginner",
    topics: ["Arrays", "Strings", "Two Pointers", "Sliding Window"],
    estimatedHours: 8,
    totalModules: 4,
    totalQuizzes: 12,
    modules: [
      { id: "m1", title: "Array Basics", order: 1, quizCount: 3 },
      { id: "m2", title: "String Manipulation", order: 2, quizCount: 3 },
      { id: "m3", title: "Two Pointers Technique", order: 3, quizCount: 3 },
      { id: "m4", title: "Sliding Window", order: 4, quizCount: 3 },
    ],
    progress: null,
  },
  {
    id: "demo-2",
    slug: "linked-lists-mastery",
    title: "Linked Lists Mastery",
    description: "Deep dive into singly and doubly linked lists. Learn common patterns like fast/slow pointers, reversal, and cycle detection.",
    thumbnail: null,
    difficulty: "easy",
    topics: ["Linked Lists", "Two Pointers", "Recursion"],
    estimatedHours: 6,
    totalModules: 3,
    totalQuizzes: 9,
    modules: [
      { id: "m5", title: "Singly Linked Lists", order: 1, quizCount: 3 },
      { id: "m6", title: "Doubly Linked Lists", order: 2, quizCount: 3 },
      { id: "m7", title: "Advanced Patterns", order: 3, quizCount: 3 },
    ],
    progress: null,
  },
  {
    id: "demo-3",
    slug: "trees-and-graphs",
    title: "Trees & Graphs",
    description: "Explore tree traversals, BST operations, and graph algorithms including BFS, DFS, and shortest path algorithms.",
    thumbnail: null,
    difficulty: "medium",
    topics: ["Binary Trees", "BST", "Graphs", "BFS", "DFS"],
    estimatedHours: 15,
    totalModules: 5,
    totalQuizzes: 20,
    modules: [
      { id: "m8", title: "Binary Tree Basics", order: 1, quizCount: 4 },
      { id: "m9", title: "Binary Search Trees", order: 2, quizCount: 4 },
      { id: "m10", title: "Graph Representations", order: 3, quizCount: 4 },
      { id: "m11", title: "Graph Traversals", order: 4, quizCount: 4 },
      { id: "m12", title: "Shortest Path", order: 5, quizCount: 4 },
    ],
    progress: null,
  },
  {
    id: "demo-4",
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Master the art of breaking down complex problems. Learn memoization, tabulation, and common DP patterns.",
    thumbnail: null,
    difficulty: "hard",
    topics: ["Dynamic Programming", "Recursion", "Memoization"],
    estimatedHours: 20,
    totalModules: 6,
    totalQuizzes: 24,
    modules: [
      { id: "m13", title: "DP Fundamentals", order: 1, quizCount: 4 },
      { id: "m14", title: "1D DP Problems", order: 2, quizCount: 4 },
      { id: "m15", title: "2D DP Problems", order: 3, quizCount: 4 },
      { id: "m16", title: "String DP", order: 4, quizCount: 4 },
      { id: "m17", title: "Tree DP", order: 5, quizCount: 4 },
      { id: "m18", title: "Advanced Patterns", order: 6, quizCount: 4 },
    ],
    progress: null,
  },
];

type Difficulty = "all" | "beginner" | "easy" | "medium" | "hard" | "expert";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (difficulty !== "all") params.set("difficulty", difficulty);
        if (search) params.set("search", search);

        const response = await fetch(`/api/courses?${params}`);
        const data = await response.json();

        // Use demo courses if no real courses exist
        if (data.courses && data.courses.length > 0) {
          setCourses(data.courses);
        } else {
          // Filter demo courses based on search/difficulty
          let filtered = demoCourses;
          if (difficulty !== "all") {
            filtered = filtered.filter((c) => c.difficulty === difficulty);
          }
          if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
              (c) =>
                c.title.toLowerCase().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.topics.some((t) => t.toLowerCase().includes(searchLower))
            );
          }
          setCourses(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses(demoCourses);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [difficulty, search]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "bg-green-500/20 text-green-400";
      case "easy":
        return "bg-blue-500/20 text-blue-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "hard":
        return "bg-orange-500/20 text-orange-400";
      case "expert":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "star_outline";
      case "easy":
        return "star_half";
      case "medium":
        return "star";
      case "hard":
        return "stars";
      case "expert":
        return "auto_awesome";
      default:
        return "star";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Catalog</h1>
          <p className="text-text-muted mt-1">
            Structured learning paths for DSA mastery
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search courses..."
            icon={<Icon name="search" size="sm" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "beginner", "easy", "medium", "hard", "expert"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              difficulty === d
                ? "bg-primary text-white"
                : "bg-surface border border-surface-border text-text-muted hover:text-white hover:border-primary/50"
            )}
          >
            {d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : courses.length === 0 ? (
        <Card variant="elevated" className="text-center py-16">
          <Icon name="school" size="xl" className="text-text-muted mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-white mb-2">No Courses Found</h2>
          <p className="text-text-muted">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`}>
              <Card
                variant="elevated"
                className="!p-0 h-full overflow-hidden group hover:border-primary/50 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-purple-500/20">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        name="school"
                        className="text-6xl text-white/20"
                      />
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
                        getDifficultyColor(course.difficulty)
                      )}
                    >
                      <Icon name={getDifficultyIcon(course.difficulty)} size="sm" />
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  {course.progress && course.progress.percentComplete > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${course.progress.percentComplete}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-text-muted mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded bg-surface text-xs text-text-muted"
                      >
                        {topic}
                      </span>
                    ))}
                    {course.topics.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-surface text-xs text-text-muted">
                        +{course.topics.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Icon name="folder" size="sm" />
                        {course.totalModules} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="quiz" size="sm" />
                        {course.totalQuizzes} quizzes
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Icon name="schedule" size="sm" />
                      {course.estimatedHours}h
                    </span>
                  </div>

                  {/* Progress */}
                  {course.progress && course.progress.percentComplete > 0 && (
                    <div className="mt-4 pt-4 border-t border-surface-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">
                          {course.progress.completedModules}/{course.totalModules} modules
                        </span>
                        <span className="text-primary font-medium">
                          {course.progress.percentComplete}% complete
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
