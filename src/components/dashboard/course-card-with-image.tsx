"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";

interface CourseCardWithImageProps {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  progress?: number;
  lessonsCount?: number;
  duration?: string;
  difficulty?: string;
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400",
  easy: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-orange-500/20 text-orange-400",
  expert: "bg-red-500/20 text-red-400",
};

const defaultImages = [
  "/images/courses/course-1.jpg",
  "/images/courses/course-2.jpg",
  "/images/courses/course-3.jpg",
  "/images/courses/course-4.jpg",
  "/images/courses/course-5.jpg",
  "/images/courses/course-6.jpg",
];

export function CourseCardWithImage({
  id,
  title,
  description,
  thumbnail,
  progress = 0,
  lessonsCount = 0,
  duration = "2h 30m",
  difficulty = "medium",
}: CourseCardWithImageProps) {
  // Use provided thumbnail or pick from defaults based on id
  const imageIndex = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % defaultImages.length;
  const imageSrc = thumbnail || defaultImages[imageIndex];

  return (
    <Link
      href={`/courses/${id}`}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-dark hover:border-primary/50 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/60 to-transparent" />

        {/* Difficulty Badge */}
        {difficulty && (
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}>
              {difficulty}
            </span>
          </div>
        )}

        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
            <Icon name="play_arrow" className="text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-text-muted text-sm line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          {lessonsCount > 0 && (
            <div className="flex items-center gap-1">
              <Icon name="menu_book" size="sm" className="text-text-muted" />
              <span>{lessonsCount} lessons</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Icon name="schedule" size="sm" className="text-text-muted" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
