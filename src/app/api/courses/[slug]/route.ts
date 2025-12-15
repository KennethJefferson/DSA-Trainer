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

    // Fetch course with modules
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            quizIds: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get all quiz IDs from this course
    const allQuizIds = course.modules.flatMap((m) => m.quizIds);

    // Fetch quiz details
    const quizzes = await prisma.quiz.findMany({
      where: { id: { in: allQuizIds } },
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
    });

    // Create quiz map for quick lookup
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));

    // Get user's progress if logged in
    let moduleProgress: Record<string, { completed: boolean; score: number; xpEarned: number }> = {};
    let quizProgress: Record<string, { completed: boolean; bestScore: number; attempts: number }> = {};

    if (session?.user?.id && allQuizIds.length > 0) {
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          userId: session.user.id,
          quizId: { in: allQuizIds },
        },
        select: {
          quizId: true,
          score: true,
          xpEarned: true,
        },
      });

      // Aggregate quiz progress
      const quizProgressMap = new Map<string, { attempts: number; bestScore: number; totalXp: number }>();

      attempts.forEach((attempt) => {
        const existing = quizProgressMap.get(attempt.quizId);
        quizProgressMap.set(attempt.quizId, {
          attempts: (existing?.attempts || 0) + 1,
          bestScore: Math.max(existing?.bestScore || 0, attempt.score),
          totalXp: (existing?.totalXp || 0) + attempt.xpEarned,
        });
      });

      // Format quiz progress
      allQuizIds.forEach((quizId) => {
        const progress = quizProgressMap.get(quizId);
        const quiz = quizMap.get(quizId);
        const passingScore = quiz?.passingScore || 70;
        quizProgress[quizId] = {
          completed: (progress?.bestScore || 0) >= passingScore,
          bestScore: progress?.bestScore || 0,
          attempts: progress?.attempts || 0,
        };
      });

      // Format module progress
      course.modules.forEach((module) => {
        const moduleQuizIds = module.quizIds;
        if (moduleQuizIds.length === 0) {
          moduleProgress[module.id] = { completed: true, score: 0, xpEarned: 0 };
          return;
        }

        const completedQuizzes = moduleQuizIds.filter(
          (qId) => quizProgress[qId]?.completed
        ).length;
        const allCompleted = completedQuizzes === moduleQuizIds.length;
        const avgScore =
          moduleQuizIds.length > 0
            ? Math.round(
                moduleQuizIds.reduce((sum, qId) => sum + (quizProgress[qId]?.bestScore || 0), 0) /
                  moduleQuizIds.length
              )
            : 0;
        const totalXp = moduleQuizIds.reduce(
          (sum, qId) => sum + (quizProgressMap.get(qId)?.totalXp || 0),
          0
        );

        moduleProgress[module.id] = {
          completed: allCompleted,
          score: avgScore,
          xpEarned: totalXp,
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
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        progress: session?.user?.id ? moduleProgress[module.id] : null,
        quizzes: module.quizIds
          .map((quizId) => {
            const quiz = quizMap.get(quizId);
            if (!quiz) return null;
            return {
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              difficulty: quiz.difficulty,
              timeLimit: quiz.timeLimit,
              passingScore: quiz.passingScore,
              questionCount: quiz._count.questions,
              progress: session?.user?.id ? quizProgress[quiz.id] : null,
            };
          })
          .filter(Boolean),
      })),
      progress: session?.user?.id
        ? {
            completedModules,
            totalModules,
            percentComplete:
              totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
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
