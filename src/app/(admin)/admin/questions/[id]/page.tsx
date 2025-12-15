import { notFound } from "next/navigation";
import { requireCreator } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin";
import { QuestionForm } from "@/components/admin/question-builder";
import type { QuestionFormData } from "@/components/admin/question-builder";

export const metadata = {
  title: "Edit Question",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: Props) {
  await requireCreator();
  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    notFound();
  }

  const initialData: QuestionFormData = {
    id: question.id,
    type: question.type as QuestionFormData["type"],
    title: question.title,
    description: question.description || "",
    difficulty: question.difficulty as QuestionFormData["difficulty"],
    topics: question.topics,
    tags: question.tags,
    xpReward: question.xpReward,
    timeLimit: question.timeLimit,
    hints: (question.hints as QuestionFormData["hints"]) || [],
    explanation: question.explanation || "",
    isPublic: question.isPublic,
    content: question.content as QuestionFormData["content"],
  };

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Edit Question"
        description={`Editing: ${question.title}`}
      />

      <div className="p-8">
        <QuestionForm mode="edit" initialData={initialData} />
      </div>
    </div>
  );
}
