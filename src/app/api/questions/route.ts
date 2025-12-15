import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createQuestionSchema,
  questionFiltersSchema,
} from "@/lib/validations/question";

// GET /api/questions - List questions with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Validate filters
    const result = questionFiltersSchema.safeParse(params);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: result.error.errors },
        { status: 400 }
      );
    }

    const { type, difficulty, topic, isPublic, search, limit, offset } =
      result.data;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (typeof isPublic === "boolean") where.isPublic = isPublic;
    if (topic) where.topics = { has: topic };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch questions
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = createQuestionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Create question
    const question = await prisma.question.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        topics: data.topics,
        tags: data.tags,
        xpReward: data.xpReward,
        timeLimit: data.timeLimit,
        hints: data.hints,
        explanation: data.explanation,
        content: data.content,
        isPublic: data.isPublic,
        metadata: data.metadata,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
