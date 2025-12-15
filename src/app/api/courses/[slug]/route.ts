import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/courses/[slug] - Get course details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    // Fetch course with modules and quizzes
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            quizzes: {
              select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                timeLimit: true,
                passingScore: true,
                _count: {
                  select: { questions: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get user's progress if logged in
    let moduleProgress: Record<string, { completed: boolean; score: number; xpEarned: number }> = {};
    let quizProgress: Record<string, { completed: boolean; bestScore: number; attempts: number }> = {};

    if (session?.user?.id) {
      // Get all quiz attempts for this course
      const quizIds = course.modules.flatMap((m) => m.quizzes.map((q) => q.id));

      const attempts = await prisma.quizAttempt.findMany({
        where: {
          userId: session.user.id,
          quizId: { in: quizIds },
        },
        select: {
          quizId: true,
          score: true,
          xpEarned: true,
          quiz: {
            select: { moduleId: true },
          },
        },
      });

      // Aggregate quiz progress
      const quizProgressMap = new Map<string, { attempts: number; bestScore: number }>();
      const moduleXpMap = new Map<string, number>();

      attempts.forEach((attempt) => {
        // Quiz progress
        const existing = quizProgressMap.get(attempt.quizId);
        if (!existing || attempt.score > existing.bestScore) {
          quizProgressMap.set(attempt.quizId, {
            attempts: (existing?.attempts || 0) + 1,
            bestScore: Math.max(existing?.bestScore || 0, attempt.score),
          });
        } else {
          quizProgressMap.set(attempt.quizId, {
            ...existing,
            attempts: existing.attempts + 1,
          });
        }

        // Module XP
        const moduleId = attempt.quiz.moduleId;
        if (moduleId) {
          moduleXpMap.set(
            moduleId,
            (moduleXpMap.get(moduleId) || 0) + attempt.xpEarned
          );
        }
      });

      // Format quiz progress
      quizIds.forEach((quizId) => {
        const progress = quizProgressMap.get(quizId);
        quizProgress[quizId] = {
          completed: (progress?.bestScore || 0) >= 70, // Default passing score
          bestScore: progress?.bestScore || 0,
          attempts: progress?.attempts || 0,
        };
      });

      // Format module progress
      course.modules.forEach((module) => {
        const moduleQuizIds = module.quizzes.map((q) => q.id);
        const completedQuizzes = moduleQuizIds.filter(
          (qId) => quizProgress[qId]?.completed
        ).length;
        const allCompleted = moduleQuizIds.length > 0 && completedQuizzes === moduleQuizIds.length;

        moduleProgress[module.id] = {
          completed: allCompleted,
          score: moduleQuizIds.length > 0
            ? Math.round(
                moduleQuizIds.reduce((sum, qId) => sum + (quizProgress[qId]?.bestScore || 0), 0) /
                  moduleQuizIds.length
              )
            : 0,
          xpEarned: moduleXpMap.get(module.id) || 0,
        };
      });
    }

    // Calculate overall progress
    const totalModules = course.modules.length;
    const completedModules = Object.values(moduleProgress).filter((m) => m.completed).length;
    const totalXpEarned = Object.values(moduleProgress).reduce((sum, m) => sum + m.xpEarned, 0);

    // Format response
    return NextResponse.json({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      difficulty: course.difficulty,
      topics: course.topics,
      estimatedHours: course.estimatedHours,
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        progress: session?.user?.id ? moduleProgress[module.id] : null,
        quizzes: module.quizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          questionCount: quiz._count.questions,
          progress: session?.user?.id ? quizProgress[quiz.id] : null,
        })),
      })),
      progress: session?.user?.id
        ? {
            completedModules,
            totalModules,
            percentComplete: totalModules > 0
              ? Math.round((completedModules / totalModules) * 100)
              : 0,
            totalXpEarned,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
