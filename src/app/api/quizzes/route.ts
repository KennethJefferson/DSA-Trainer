import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "easy", "medium", "hard", "expert"]).optional(),
  topics: z.array(z.string()).default([]),
  questionIds: z.array(z.string()).min(1, "At least one question required"),
  timeLimit: z.number().int().positive().optional(),
  passingScore: z.number().int().min(0).max(100).default(70),
  isPublic: z.boolean().default(false),
});

// GET /api/quizzes - List quizzes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const isPublic = searchParams.get("public");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (topic) where.topics = { has: topic };
    if (difficulty) where.difficulty = difficulty;
    if (isPublic !== null) where.isPublic = isPublic === "true";

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  type: true,
                  difficulty: true,
                  xpReward: true,
                },
              },
            },
          },
          _count: {
            select: { attempts: true },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    // Transform response
    const transformedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      topics: quiz.topics,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      isPublic: quiz.isPublic,
      questionCount: quiz.questions.length,
      totalXp: quiz.questions.reduce((sum, q) => sum + q.question.xpReward, 0),
      attemptCount: quiz._count.attempts,
      createdAt: quiz.createdAt,
    }));

    return NextResponse.json({
      quizzes: transformedQuizzes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = createQuizSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { title, description, difficulty, topics, questionIds, timeLimit, passingScore, isPublic } = result.data;

    // Verify all questions exist
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    });

    if (questions.length !== questionIds.length) {
      return NextResponse.json(
        { error: "Some questions were not found" },
        { status: 400 }
      );
    }

    // Create quiz with question connections
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        difficulty,
        topics,
        timeLimit,
        passingScore,
        isPublic,
        questions: {
          create: questionIds.map((questionId, index) => ({
            questionId,
            order: index,
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
