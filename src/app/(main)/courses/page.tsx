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
    thumbnail: "/images/courses/course-1.jpg",
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
    progress: { completedModules: 2, totalXp: 150, percentComplete: 50 },
  },
  {
    id: "demo-2",
    slug: "linked-lists-mastery",
    title: "Linked Lists Mastery",
    description: "Deep dive into singly and doubly linked lists. Learn common patterns like fast/slow pointers, reversal, and cycle detection.",
    thumbnail: "/images/courses/course-2.jpg",
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
    thumbnail: "/images/courses/course-3.jpg",
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
    thumbnail: "/images/courses/course-4.jpg",
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
  {
    id: "demo-5",
    slug: "stacks-queues",
    title: "Stacks & Queues",
    description: "Learn the fundamentals of stack and queue data structures and their applications in algorithms.",
    thumbnail: "/images/courses/course-5.jpg",
    difficulty: "easy",
    topics: ["Stacks", "Queues", "Deque", "Priority Queue"],
    estimatedHours: 5,
    totalModules: 3,
    totalQuizzes: 9,
    modules: [
      { id: "m19", title: "Stack Basics", order: 1, quizCount: 3 },
      { id: "m20", title: "Queue Implementations", order: 2, quizCount: 3 },
      { id: "m21", title: "Advanced Applications", order: 3, quizCount: 3 },
    ],
    progress: null,
  },
  {
    id: "demo-6",
    slug: "sorting-algorithms",
    title: "Sorting Algorithms",
    description: "Deep dive into sorting algorithms from bubble sort to quicksort and understand time/space complexity.",
    thumbnail: "/images/courses/course-6.jpg",
    difficulty: "medium",
    topics: ["Sorting", "Divide & Conquer", "Comparison Sorts"],
    estimatedHours: 10,
    totalModules: 4,
    totalQuizzes: 16,
    modules: [
      { id: "m22", title: "Basic Sorts", order: 1, quizCount: 4 },
      { id: "m23", title: "Efficient Sorts", order: 2, quizCount: 4 },
      { id: "m24", title: "Comparison Analysis", order: 3, quizCount: 4 },
      { id: "m25", title: "Special Cases", order: 4, quizCount: 4 },
    ],
    progress: null,
  },
];

type Difficulty = "all" | "beginner" | "easy" | "medium" | "hard" | "expert";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  easy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  expert: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");

  // Get featured course (the one with progress or first one)
  const featuredCourse = courses.find(c => c.progress && c.progress.percentComplete > 0) || courses[0];

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

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-8">
      {/* Hero Section */}
      {!loading && featuredCourse && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-surface-dark to-background border border-white/5">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero/course-catalog-hero.jpg"
              alt="Featured course background"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">
            {/* Featured Course Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                  {featuredCourse.progress ? "Continue Learning" : "Featured Course"}
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                {featuredCourse.title}
              </h2>

              <p className="text-text-muted text-lg max-w-xl">
                {featuredCourse.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Icon name="folder" size="sm" />
                  {featuredCourse.totalModules} modules
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="quiz" size="sm" />
                  {featuredCourse.totalQuizzes} quizzes
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="schedule" size="sm" />
                  {featuredCourse.estimatedHours}h
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Link href={`/courses/${featuredCourse.slug}`}>
                  <Button size="lg" className="gap-2">
                    <Icon name={featuredCourse.progress ? "play_arrow" : "arrow_forward"} size="sm" />
                    {featuredCourse.progress ? "Resume Course" : "Start Learning"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Progress Circle */}
            {featuredCourse.progress && (
              <div className="flex-shrink-0">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-surface-light"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="8"
                      strokeDasharray={`${featuredCourse.progress.percentComplete * 2.64} 264`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{featuredCourse.progress.percentComplete}%</span>
                    <span className="text-xs text-text-muted">Complete</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              <Icon name="search" size="sm" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(["all", "beginner", "easy", "medium", "hard", "expert"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                difficulty === d
                  ? "bg-primary text-white shadow-glow-sm"
                  : "bg-surface border border-white/10 text-text-muted hover:text-white hover:border-primary/50"
              )}
            >
              {d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
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
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-dark hover:border-primary/50 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={course.thumbnail || "/images/courses/course-1.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/60 to-transparent" />

                {/* Difficulty Badge */}
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded border",
                    difficultyColors[course.difficulty] || difficultyColors.medium
                  )}>
                    {course.difficulty}
                  </span>
                </div>

                {/* Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-glow transform scale-90 group-hover:scale-100 transition-transform">
                    <Icon name="play_arrow" className="text-white text-2xl" />
                  </div>
                </div>

                {/* Progress Bar */}
                {course.progress && course.progress.percentComplete > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-400"
                      style={{ width: `${course.progress.percentComplete}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <p className="text-text-muted text-sm line-clamp-2 mb-4">
                  {course.description}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-1.5 mb-4">
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

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Icon name="menu_book" size="sm" />
                      {course.totalModules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="quiz" size="sm" />
                      {course.totalQuizzes}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Icon name="schedule" size="sm" />
                    {course.estimatedHours}h
                  </span>
                </div>

                {/* Progress */}
                {course.progress && course.progress.percentComplete > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">
                        {course.progress.completedModules}/{course.totalModules} completed
                      </span>
                      <span className="text-primary font-medium">
                        {course.progress.percentComplete}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && courses.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" className="gap-2">
            <Icon name="expand_more" size="sm" />
            Load More Courses
          </Button>
        </div>
      )}
    </div>
  );
}
