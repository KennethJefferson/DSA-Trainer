"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon, Button } from "@/components/ui";

interface DailyChallengeWidgetProps {
  challenge?: {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    quizId: string;
    participantCount?: number;
  } | null;
  userCompleted?: boolean;
}

const avatars = [
  "/images/avatars/avatar-1.jpg",
  "/images/avatars/avatar-2.jpg",
  "/images/avatars/avatar-3.jpg",
];

export function DailyChallengeWidget({ challenge, userCompleted }: DailyChallengeWidgetProps) {
  const hasChallenge = !!challenge;
  const participantCount = challenge?.participantCount || 0;

  return (
    <div className="bg-gradient-to-b from-[#362348] to-surface-dark rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Icon name="bolt" className="text-yellow-400" size="sm" />
          </div>
          <h3 className="text-lg font-bold text-white">Daily Challenge</h3>
        </div>
        {hasChallenge && (
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
            +50 XP
          </span>
        )}
      </div>

      {hasChallenge ? (
        <>
          {/* Challenge Info */}
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/5">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">{challenge.title}</h4>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                challenge.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                challenge.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-orange-500/20 text-orange-400"
              }`}>
                {challenge.difficulty}
              </span>
            </div>
            {challenge.description && (
              <p className="text-xs text-text-muted line-clamp-2">
                {challenge.description}
              </p>
            )}
          </div>

          {/* Participants */}
          {participantCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {avatars.slice(0, Math.min(3, participantCount)).map((avatar, index) => (
                  <Image
                    key={index}
                    src={avatar}
                    alt="Participant"
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-surface-dark"
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted">
                {participantCount} {participantCount === 1 ? "participant" : "participants"} today
              </span>
            </div>
          )}

          {/* Action Button */}
          {userCompleted ? (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
              <Icon name="check_circle" className="text-success" size="sm" />
              <span className="text-success text-sm font-medium">Completed Today!</span>
            </div>
          ) : (
            <Link href={`/quiz/${challenge.quizId}`}>
              <Button className="w-full">
                <Icon name="play_arrow" size="sm" className="mr-2" />
                Start Challenge
              </Button>
            </Link>
          )}
        </>
      ) : (
        <>
          {/* No Challenge State */}
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/5 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-light mx-auto mb-3 flex items-center justify-center">
              <Icon name="hourglass_empty" className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-white mb-1">Coming Soon!</p>
            <p className="text-xs text-text-muted">
              Daily challenges will be available once questions are added to the system.
            </p>
          </div>
          <Button variant="secondary" className="w-full" disabled>
            No Challenge Available
          </Button>
        </>
      )}
    </div>
  );
}
