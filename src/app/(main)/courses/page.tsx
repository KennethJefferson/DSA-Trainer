import { Card, Icon } from "@/components/ui";

export const metadata = {
  title: "Courses",
};

export default function CoursesPage() {
  return (
    <div className="max-w-[1600px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Catalog</h1>
          <p className="text-text-muted mt-1">
            Browse DSA topics and start learning
          </p>
        </div>
      </div>

      <Card variant="elevated" className="text-center py-16">
        <Icon name="school" size="xl" className="text-text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-text-muted">
          Structured courses will be available here once content is added.
        </p>
      </Card>
    </div>
  );
}
