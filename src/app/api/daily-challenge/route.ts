import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/daily-challenge - Get today's challenge
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's challenge
    const challenge = await prisma.dailyChallenge.findFirst({
      where: {
        date: today,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ challenge: null });
    }

    // Check if current user has completed today's challenge
    let userCompleted = false;
    if (session?.user?.id) {
      const participation = await prisma.dailyChallengeParticipation.findUnique({
        where: {
          userId_challengeId: {
            userId: session.user.id,
            challengeId: challenge.id,
          },
        },
      });
      userCompleted = !!participation?.completedAt;
    }

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        quizId: challenge.quiz.id,
        quizTitle: challenge.quiz.title,
        participantCount: challenge._count.participants,
        userCompleted,
      },
    });
  } catch (error) {
    console.error("Error fetching daily challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily challenge" },
      { status: 500 }
    );
  }
}

// POST /api/daily-challenge - Create a new daily challenge (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { date, quizId, title, description, difficulty } = body;

    const challenge = await prisma.dailyChallenge.create({
      data: {
        date: new Date(date),
        quizId,
        title,
        description,
        difficulty,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error("Error creating daily challenge:", error);
    return NextResponse.json(
      { error: "Failed to create daily challenge" },
      { status: 500 }
    );
  }
}
