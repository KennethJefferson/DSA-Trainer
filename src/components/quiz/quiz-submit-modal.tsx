"use client";

import { useRouter } from "next/navigation";
import { useQuiz } from "./quiz-context";
import { Button, Icon, Card } from "@/components/ui";
import { cn } from "@/lib/cn";

interface QuizSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuizSubmitModal({ isOpen, onClose }: QuizSubmitModalProps) {
  const router = useRouter();
  const { state, submitQuiz, answeredCount } = useQuiz();

  if (!isOpen) return null;

  const unansweredCount = state.questions.length - answeredCount;

  const handleSubmit = async () => {
    submitQuiz();
    // In a real app, this would call an API to save results
    // For now, redirect to results page
    router.push(`/quiz/${state.quizId}/results`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card variant="elevated" className="relative z-10 w-full max-w-md !p-0">
        {/* Header */}
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon name="assignment_turned_in" className="text-primary" size="lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Submit Quiz?</h2>
              <p className="text-sm text-text-muted">
                Review your progress before submitting
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="check_circle" size="sm" className="text-success" />
                <span className="text-xs text-text-muted">Answered</span>
              </div>
              <p className="text-2xl font-bold text-white">{answeredCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="help" size="sm" className="text-warning" />
                <span className="text-xs text-text-muted">Unanswered</span>
              </div>
              <p className="text-2xl font-bold text-white">{unansweredCount}</p>
            </div>
          </div>

          {/* Warning if unanswered */}
          {unansweredCount > 0 && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-3">
                <Icon name="warning" className="text-warning flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning">
                    You have {unansweredCount} unanswered question
                    {unansweredCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Unanswered questions will be marked as incorrect.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <p className="text-xs text-text-muted text-center">
            Once submitted, you cannot change your answers.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-surface-border flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Keep Answering
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit Quiz
          </Button>
        </div>
      </Card>
    </div>
  );
}
