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

    // Fetch courses with module count
    const courses = await prisma.course.findMany({
      where,
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            _count: {
              select: { quizzes: true },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user's progress for each course if logged in
    let userProgress: Record<string, { completedModules: number; totalXp: number }> = {};
    if (session?.user?.id) {
      // Get quiz attempts for courses
      const courseIds = courses.map((c) => c.id);
      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId: session.user.id,
          quiz: {
            moduleId: {
              in: courses.flatMap((c) => c.modules.map((m) => m.id)),
            },
          },
        },
        select: {
          quiz: {
            select: {
              moduleId: true,
              module: {
                select: { courseId: true },
              },
            },
          },
          xpEarned: true,
        },
      });

      // Aggregate progress by course
      const progressMap = new Map<string, Set<string>>();
      const xpMap = new Map<string, number>();

      quizAttempts.forEach((attempt) => {
        const courseId = attempt.quiz.module?.courseId;
        const moduleId = attempt.quiz.moduleId;

        if (courseId && moduleId) {
          if (!progressMap.has(courseId)) {
            progressMap.set(courseId, new Set());
            xpMap.set(courseId, 0);
          }
          progressMap.get(courseId)!.add(moduleId);
          xpMap.set(courseId, (xpMap.get(courseId) || 0) + attempt.xpEarned);
        }
      });

      courseIds.forEach((id) => {
        userProgress[id] = {
          completedModules: progressMap.get(id)?.size || 0,
          totalXp: xpMap.get(id) || 0,
        };
      });
    }

    // Format response
    const formattedCourses = courses.map((course) => {
      const totalQuizzes = course.modules.reduce(
        (sum, m) => sum + m._count.quizzes,
        0
      );

      const progress = userProgress[course.id];
      const progressPercent = course._count.modules > 0
        ? Math.round((progress?.completedModules || 0) / course._count.modules * 100)
        : 0;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        difficulty: course.difficulty,
        topics: course.topics,
        estimatedHours: course.estimatedHours,
        totalModules: course._count.modules,
        totalQuizzes,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          quizCount: m._count.quizzes,
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
