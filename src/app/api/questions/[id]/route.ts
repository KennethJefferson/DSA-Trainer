import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateQuestionSchema } from "@/lib/validations/question";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/questions/[id] - Get a single question
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PUT /api/questions/[id] - Update a question
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if question exists and user is owner
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    if (existingQuestion.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this question" },
        { status: 403 }
      );
    }

    // Validate input
    const result = updateQuestionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Update question
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.topics && { topics: data.topics }),
        ...(data.tags && { tags: data.tags }),
        ...(data.xpReward !== undefined && { xpReward: data.xpReward }),
        ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit }),
        ...(data.hints && { hints: data.hints }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.content && { content: data.content }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.metadata && { metadata: data.metadata }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete a question
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if question exists and user is owner
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    if (existingQuestion.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this question" },
        { status: 403 }
      );
    }

    // Delete question
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
