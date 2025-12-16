import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals - List user's goals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.learningGoal.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isCompleted: "asc" },
        { targetDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, targetValue, goalType, targetDate } = body;

    if (!title || !targetValue || !goalType) {
      return NextResponse.json(
        { error: "Title, target value, and goal type are required" },
        { status: 400 }
      );
    }

    const goal = await prisma.learningGoal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        targetValue,
        goalType,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
