"use client";

import { useQuiz } from "./quiz-context";
import { Icon } from "@/components/ui";

export function QuizTimer() {
  const { state } = useQuiz();

  // Calculate minutes and seconds from timeRemaining
  const minutes = Math.floor((state.timeRemaining || 0) / 60);
  const seconds = (state.timeRemaining || 0) % 60;

  // Determine urgency styling
  const isUrgent = (state.timeRemaining || 0) <= 60; // Less than 1 minute
  const isWarning = (state.timeRemaining || 0) <= 120 && !isUrgent; // Less than 2 minutes

  return (
    <div className="bg-surface-dark rounded-xl p-5 border border-border-dark shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-text-muted">
        <Icon name="timer" />
        <span className="text-sm font-semibold uppercase tracking-wider">Time Remaining</span>
      </div>
      <div className="flex gap-3">
        {/* Minutes */}
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className={`flex h-16 w-full items-center justify-center rounded-lg border ${
            isUrgent ? 'bg-red-900/20 border-red-500/30' :
            isWarning ? 'bg-yellow-900/20 border-yellow-500/30' :
            'bg-background border-border-dark'
          }`}>
            <p className={`text-2xl font-bold font-mono ${
              isUrgent ? 'text-red-400' :
              isWarning ? 'text-yellow-400' :
              'text-white'
            }`}>
              {String(minutes).padStart(2, '0')}
            </p>
          </div>
          <p className="text-xs font-medium text-text-muted">Minutes</p>
        </div>

        {/* Separator */}
        <div className="flex items-center pt-2">
          <span className={`text-xl font-bold ${
            isUrgent ? 'text-red-400 animate-pulse' :
            isWarning ? 'text-yellow-400' :
            'text-text-muted'
          }`}>:</span>
        </div>

        {/* Seconds */}
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className={`flex h-16 w-full items-center justify-center rounded-lg border ${
            isUrgent ? 'bg-red-900/20 border-red-500/30' :
            isWarning ? 'bg-yellow-900/20 border-yellow-500/30' :
            'bg-background border-border-dark'
          }`}>
            <p className={`text-2xl font-bold font-mono ${
              isUrgent ? 'text-red-400' :
              isWarning ? 'text-yellow-400' :
              'text-white'
            }`}>
              {String(seconds).padStart(2, '0')}
            </p>
          </div>
          <p className="text-xs font-medium text-text-muted">Seconds</p>
        </div>
      </div>
    </div>
  );
}
