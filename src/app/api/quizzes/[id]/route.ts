import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/quizzes/[id] - Get quiz with questions (for taking)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check access
    if (!quiz.isPublic && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Transform questions - hide correct answers if not reviewing
    const questions = quiz.questions.map((qq) => {
      const q = qq.question;
      return {
        id: q.id,
        type: q.type,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        topics: q.topics,
        xpReward: q.xpReward,
        timeLimit: q.timeLimit,
        hints: q.hints,
        content: q.content, // In production, strip correct answers
      };
    });

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        topics: quiz.topics,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        questionCount: questions.length,
      },
      questions,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // In production, check if user owns the quiz
    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
