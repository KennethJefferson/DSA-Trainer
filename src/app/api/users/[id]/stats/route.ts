import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]/stats - Get user statistics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id: userId } = await params;

    // Use "me" as a special id to get current user's stats
    const targetUserId = userId === "me" ? session?.user?.id : userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user with progress
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        lastActiveAt: true,
        progress: {
          select: {
            totalXp: true,
            totalQuizzes: true,
            totalQuestions: true,
            correctAnswers: true,
            topicProgress: true,
            dailyActivity: true,
            lastQuizAt: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get recent quiz attempts
    const recentQuizzes = await prisma.quizAttempt.findMany({
      where: { userId: targetUserId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    // Calculate accuracy
    const accuracy =
      user.progress?.totalQuestions && user.progress.totalQuestions > 0
        ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
        : 0;

    // Get user's rank
    const higherRankedCount = await prisma.userProgress.count({
      where: {
        totalXp: { gt: user.progress?.totalXp || 0 },
      },
    });
    const rank = higherRankedCount + 1;

    // Calculate level progress (XP to next level)
    const xpForCurrentLevel = Math.pow(user.level, 2) * 100;
    const xpForNextLevel = Math.pow(user.level + 1, 2) * 100;
    const xpInCurrentLevel = user.xp - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const levelProgress = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);

    // Get daily activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyQuizzes = await prisma.quizAttempt.groupBy({
      by: ["completedAt"],
      where: {
        userId: targetUserId,
        completedAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      _sum: { xpEarned: true },
    });

    // Format activity data
    const activityMap = new Map<string, { quizzes: number; xp: number }>();
    dailyQuizzes.forEach((day) => {
      if (day.completedAt) {
        const dateKey = day.completedAt.toISOString().split("T")[0];
        activityMap.set(dateKey, {
          quizzes: day._count.id,
          xp: day._sum.xpEarned || 0,
        });
      }
    });

    // Generate last 30 days array
    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const activity = activityMap.get(dateKey);
      activityData.push({
        date: dateKey,
        quizzes: activity?.quizzes || 0,
        xp: activity?.xp || 0,
      });
    }

    // Get topic mastery
    const topicProgress = (user.progress?.topicProgress as Record<string, { correct: number; total: number }>) || {};
    const topicMastery = Object.entries(topicProgress).map(([topic, data]) => ({
      topic,
      mastery: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      questionsAnswered: data.total,
    })).sort((a, b) => b.mastery - a.mastery);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: targetUserId === session?.user?.id ? user.email : undefined,
        avatar: user.image,
        joinedAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      },
      stats: {
        xp: user.xp,
        level: user.level,
        levelProgress,
        xpToNextLevel: xpNeededForNextLevel - xpInCurrentLevel,
        streak: user.streak,
        rank,
        totalQuizzes: user.progress?.totalQuizzes || 0,
        totalQuestions: user.progress?.totalQuestions || 0,
        correctAnswers: user.progress?.correctAnswers || 0,
        accuracy,
      },
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt,
      })),
      recentQuizzes: recentQuizzes.map((qa) => ({
        id: qa.id,
        quizId: qa.quiz.id,
        quizTitle: qa.quiz.title,
        difficulty: qa.quiz.difficulty,
        score: qa.score,
        xpEarned: qa.xpEarned,
        completedAt: qa.completedAt,
        passed: qa.score >= 70, // Default passing score
      })),
      activityData,
      topicMastery,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
