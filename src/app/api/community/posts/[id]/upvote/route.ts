import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/community/posts/[id]/upvote - Upvote a post
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment upvotes
    const updatedPost = await prisma.forumPost.update({
      where: { id: params.id },
      data: {
        upvotes: { increment: 1 },
      },
    });

    return NextResponse.json({ upvotes: updatedPost.upvotes });
  } catch (error) {
    console.error("Error upvoting post:", error);
    return NextResponse.json(
      { error: "Failed to upvote post" },
      { status: 500 }
    );
  }
}
