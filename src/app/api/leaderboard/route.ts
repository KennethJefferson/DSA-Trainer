import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/leaderboard - Get leaderboard rankings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const timeframe = searchParams.get("timeframe") || "all"; // all, week, month
    const type = searchParams.get("type") || "xp"; // xp, quizzes, accuracy, streak

    const skip = (page - 1) * limit;

    // Build date filter for timeframe
    let dateFilter: Date | undefined;
    if (timeframe === "week") {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeframe === "month") {
      dateFilter = new Date();
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    }

    // Get users with their progress data
    let users;
    let orderBy: Record<string, "asc" | "desc"> = { totalXp: "desc" };

    switch (type) {
      case "quizzes":
        orderBy = { totalQuizzes: "desc" };
        break;
      case "accuracy":
        // For accuracy, we need to calculate it
        orderBy = { correctAnswers: "desc" };
        break;
      case "streak":
        // Streak would come from User model
        users = await prisma.user.findMany({
          where: {
            ...(dateFilter && { lastActiveAt: { gte: dateFilter } }),
          },
          select: {
            id: true,
            name: true,
            image: true,
            xp: true,
            level: true,
            streak: true,
            progress: {
              select: {
                totalQuizzes: true,
                totalQuestions: true,
                correctAnswers: true,
              },
            },
          },
          orderBy: { streak: "desc" },
          take: limit,
          skip,
        });
        break;
      default: // xp
        orderBy = { totalXp: "desc" };
    }

    // If not streak type, query from UserProgress
    if (type !== "streak") {
      const progressData = await prisma.userProgress.findMany({
        where: {
          ...(dateFilter && { lastQuizAt: { gte: dateFilter } }),
        },
        select: {
          userId: true,
          totalXp: true,
          totalQuizzes: true,
          totalQuestions: true,
          correctAnswers: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              xp: true,
              level: true,
              streak: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip,
      });

      users = progressData.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        image: p.user.image,
        xp: type === "xp" ? p.totalXp : p.user.xp,
        level: p.user.level,
        streak: p.user.streak,
        progress: {
          totalQuizzes: p.totalQuizzes,
          totalQuestions: p.totalQuestions,
          correctAnswers: p.correctAnswers,
        },
      }));
    }

    // Calculate rankings and format response
    const leaderboard = (users || []).map((user, index) => {
      const accuracy =
        user.progress?.totalQuestions && user.progress.totalQuestions > 0
          ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
          : 0;

      return {
        rank: skip + index + 1,
        id: user.id,
        name: user.name || "Anonymous",
        avatar: user.image,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        quizzesTaken: user.progress?.totalQuizzes || 0,
        questionsAnswered: user.progress?.totalQuestions || 0,
        accuracy,
        isCurrentUser: session?.user?.id === user.id,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.userProgress.count({
      where: {
        ...(dateFilter && { lastQuizAt: { gte: dateFilter } }),
      },
    });

    // Get current user's rank if logged in
    let currentUserRank = null;
    if (session?.user?.id) {
      const userProgress = await prisma.userProgress.findUnique({
        where: { userId: session.user.id },
        select: { totalXp: true },
      });

      if (userProgress) {
        const higherRanked = await prisma.userProgress.count({
          where: {
            totalXp: { gt: userProgress.totalXp },
            ...(dateFilter && { lastQuizAt: { gte: dateFilter } }),
          },
        });
        currentUserRank = higherRanked + 1;
      }
    }

    return NextResponse.json({
      leaderboard,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      currentUserRank,
      timeframe,
      type,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
