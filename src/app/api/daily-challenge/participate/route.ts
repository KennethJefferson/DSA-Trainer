import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/daily-challenge/participate - Complete today's challenge
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, score } = body;

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Get the challenge
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Calculate XP bonus for daily challenge (50 XP bonus)
    const xpBonus = 50;

    // Upsert participation
    const participation = await prisma.dailyChallengeParticipation.upsert({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId,
        },
      },
      update: {
        completedAt: new Date(),
        score: score || 0,
        xpEarned: xpBonus,
      },
      create: {
        userId: session.user.id,
        challengeId,
        completedAt: new Date(),
        score: score || 0,
        xpEarned: xpBonus,
      },
    });

    // Award bonus XP to user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: { increment: xpBonus },
      },
    });

    return NextResponse.json({
      participation,
      xpEarned: xpBonus,
      message: "Challenge completed! +50 XP bonus",
    });
  } catch (error) {
    console.error("Error completing daily challenge:", error);
    return NextResponse.json(
      { error: "Failed to complete daily challenge" },
      { status: 500 }
    );
  }
}
