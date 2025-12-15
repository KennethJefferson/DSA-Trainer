"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Icon, Input } from "@/components/ui";

interface HeaderProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between gap-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              name="search"
              size="sm"
              className="text-text-muted group-focus-within:text-primary transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Search for courses, quizzes, or topics..."
            className="block w-full pl-10 pr-3 py-2.5 bg-surface-dark border-none rounded-lg text-sm text-white placeholder-text-muted focus:ring-2 focus:ring-primary focus:bg-surface-light transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-surface-light text-text-muted hover:text-white transition-colors">
          <Icon name="notifications" />
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-background" />
        </button>

        <div className="h-8 w-[1px] bg-white/10" />

        {/* Streak Badge */}
        <div className="bg-surface-dark px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
          <Icon name="bolt" size="sm" className="text-yellow-500" filled />
          <span className="text-sm font-bold text-white">0 Day Streak</span>
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-light transition-colors"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="person" size="sm" className="text-primary" />
              </div>
            )}
            <Icon name="expand_more" size="sm" className="text-text-muted" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-surface-dark rounded-xl border border-white/5 shadow-xl z-20 py-2">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-light transition-colors flex items-center gap-2"
                >
                  <Icon name="logout" size="sm" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
