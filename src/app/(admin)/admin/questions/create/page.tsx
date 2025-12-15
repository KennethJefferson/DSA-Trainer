import { requireCreator } from "@/lib/auth-utils";
import { AdminHeader } from "@/components/admin";
import { QuestionForm } from "@/components/admin/question-builder";

export const metadata = {
  title: "Create Question",
};

export default async function CreateQuestionPage() {
  await requireCreator();

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Create Question"
        description="Build a new question for the quiz system"
      />

      <div className="p-8">
        <QuestionForm mode="create" />
      </div>
    </div>
  );
}
