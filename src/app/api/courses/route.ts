import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses - List all courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Query parameters
    const difficulty = searchParams.get("difficulty");
    const topic = searchParams.get("topic");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (topic) {
      where.topics = { has: topic };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch courses with modules
    const courses = await prisma.course.findMany({
      where,
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            quizIds: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user's progress for each course if logged in
    let userProgress: Record<string, { completedModules: number; totalXp: number }> = {};
    if (session?.user?.id) {
      // Get all quiz IDs from all courses
      const allQuizIds = courses.flatMap((c) =>
        c.modules.flatMap((m) => m.quizIds)
      );

      if (allQuizIds.length > 0) {
        const quizAttempts = await prisma.quizAttempt.findMany({
          where: {
            userId: session.user.id,
            quizId: { in: allQuizIds },
          },
          select: {
            quizId: true,
            xpEarned: true,
          },
        });

        // Build map of completed quizzes
        const completedQuizzes = new Set(quizAttempts.map((a) => a.quizId));
        const xpByQuiz = new Map<string, number>();
        quizAttempts.forEach((a) => {
          xpByQuiz.set(a.quizId, (xpByQuiz.get(a.quizId) || 0) + a.xpEarned);
        });

        // Calculate progress per course
        courses.forEach((course) => {
          let completedModules = 0;
          let totalXp = 0;

          course.modules.forEach((module) => {
            const moduleQuizIds = module.quizIds;
            if (moduleQuizIds.length > 0) {
              const completedInModule = moduleQuizIds.filter((qId) =>
                completedQuizzes.has(qId)
              ).length;
              if (completedInModule === moduleQuizIds.length) {
                completedModules++;
              }
              moduleQuizIds.forEach((qId) => {
                totalXp += xpByQuiz.get(qId) || 0;
              });
            }
          });

          userProgress[course.id] = { completedModules, totalXp };
        });
      }
    }

    // Format response
    const formattedCourses = courses.map((course) => {
      const totalQuizzes = course.modules.reduce(
        (sum, m) => sum + m.quizIds.length,
        0
      );
      const totalModules = course.modules.length;

      const progress = userProgress[course.id];
      const progressPercent =
        totalModules > 0
          ? Math.round(((progress?.completedModules || 0) / totalModules) * 100)
          : 0;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        difficulty: course.difficulty,
        topics: course.topics,
        totalModules,
        totalQuizzes,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          quizCount: m.quizIds.length,
        })),
        progress: session?.user?.id
          ? {
              completedModules: progress?.completedModules || 0,
              totalXp: progress?.totalXp || 0,
              percentComplete: progressPercent,
            }
          : null,
      };
    });

    return NextResponse.json({
      courses: formattedCourses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
