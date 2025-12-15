import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const submitSchema = z.object({
  answers: z.record(z.unknown()), // questionId -> answer
  hintsUsed: z.record(z.array(z.string())), // questionId -> hintIds
  timeSpent: z.number().int().min(0), // seconds
  startedAt: z.string().datetime(),
});

// POST /api/quizzes/[id]/submit - Submit quiz answers
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const body = await request.json();

    // Validate input
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { answers, hintsUsed, timeSpent } = result.data;

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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

    // Grade each question
    const questionResults = quiz.questions.map((qq) => {
      const question = qq.question;
      const userAnswer = answers[question.id];
      const questionHints = hintsUsed[question.id] || [];

      // Calculate hint penalty
      const hintPenalty = (question.hints as Array<{ id: string; xpPenalty: number }> || [])
        .filter((h) => questionHints.includes(h.id))
        .reduce((sum, h) => sum + h.xpPenalty, 0);

      // Grade answer based on question type
      const isCorrect = gradeAnswer(question.type, question.content as Record<string, unknown>, userAnswer);

      // Calculate XP earned
      const xpEarned = isCorrect ? Math.max(0, question.xpReward - hintPenalty) : 0;

      return {
        questionId: question.id,
        isCorrect,
        xpEarned,
        hintsUsed: questionHints.length,
        userAnswer,
      };
    });

    // Calculate totals
    const correctCount = questionResults.filter((r) => r.isCorrect).length;
    const totalCount = questionResults.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const totalXpEarned = questionResults.reduce((sum, r) => sum + r.xpEarned, 0);

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        xpEarned: totalXpEarned,
        correctCount,
        totalCount,
        timeSpent,
        completedAt: new Date(),
        answers: {
          create: questionResults.map((r) => ({
            questionId: r.questionId,
            userAnswer: r.userAnswer as object,
            isCorrect: r.isCorrect,
            xpEarned: r.xpEarned,
            hintsUsed: r.hintsUsed,
            timeSpent: 0, // Could track per-question time
          })),
        },
      },
    });

    // Update user XP and progress
    await prisma.$transaction([
      // Update user XP
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: totalXpEarned },
          lastActiveAt: new Date(),
        },
      }),
      // Update or create user progress
      prisma.userProgress.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalXp: totalXpEarned,
          totalQuizzes: 1,
          totalQuestions: totalCount,
          correctAnswers: correctCount,
          lastQuizAt: new Date(),
        },
        update: {
          totalXp: { increment: totalXpEarned },
          totalQuizzes: { increment: 1 },
          totalQuestions: { increment: totalCount },
          correctAnswers: { increment: correctCount },
          lastQuizAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      correctCount,
      totalCount,
      xpEarned: totalXpEarned,
      timeSpent,
      passed: score >= quiz.passingScore,
      questionResults,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// Helper function to grade answers by question type
function gradeAnswer(type: string, content: Record<string, unknown>, userAnswer: unknown): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;

  switch (type) {
    case "multiple_choice": {
      const options = content.options as Array<{ id: string; isCorrect: boolean }>;
      const correctOption = options.find((o) => o.isCorrect);
      return correctOption?.id === userAnswer;
    }

    case "multi_select": {
      const options = content.options as Array<{ id: string; isCorrect: boolean }>;
      const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id).sort();
      const userIds = (userAnswer as string[] || []).sort();
      return JSON.stringify(correctIds) === JSON.stringify(userIds);
    }

    case "true_false": {
      return content.isTrue === userAnswer;
    }

    case "fill_blank": {
      const blanks = content.blanks as Array<{
        id: string;
        acceptedAnswers: string[];
        caseSensitive: boolean;
      }>;
      const userAnswers = userAnswer as Record<string, string>;

      return blanks.every((blank) => {
        const userValue = userAnswers[blank.id] || "";
        return blank.acceptedAnswers.some((accepted) =>
          blank.caseSensitive
            ? userValue === accepted
            : userValue.toLowerCase() === accepted.toLowerCase()
        );
      });
    }

    case "drag_order": {
      const items = content.items as Array<{ id: string; correctPosition: number }>;
      const userOrder = userAnswer as string[];

      return items.every((item) => {
        const userPosition = userOrder.indexOf(item.id);
        return userPosition === item.correctPosition;
      });
    }

    case "drag_match": {
      const leftItems = content.leftItems as Array<{ id: string; matchId: string }>;
      const userMatches = userAnswer as Record<string, string>;

      return leftItems.every((item) => userMatches[item.id] === item.matchId);
    }

    case "drag_code_blocks": {
      const blocks = content.blocks as Array<{ id: string; correctPosition: number }>;
      const userOrder = userAnswer as string[];

      // Filter out distractors from user answer
      const validBlocks = blocks.filter((b) => b.correctPosition >= 0);
      return validBlocks.every((block) => {
        const userPosition = userOrder.indexOf(block.id);
        return userPosition === block.correctPosition;
      });
    }

    case "parsons": {
      const codeLines = content.codeLines as Array<{
        id: string;
        correctPosition: number;
        correctIndent: number;
      }>;
      const userLines = userAnswer as Array<{ id: string; indent: number }>;

      return codeLines.every((line, index) => {
        const userLine = userLines[index];
        return (
          userLine &&
          userLine.id === line.id &&
          userLine.indent === line.correctIndent
        );
      });
    }

    case "code_writing":
    case "debugging": {
      // These require code execution to grade properly
      // For now, return false (would need Judge0 integration)
      return false;
    }

    default:
      return false;
  }
}
