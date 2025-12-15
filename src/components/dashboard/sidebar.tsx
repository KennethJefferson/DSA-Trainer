"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/courses", icon: "book_2", label: "Courses" },
  { href: "/quizzes", icon: "quiz", label: "Quizzes" },
  { href: "/leaderboard", icon: "trophy", label: "Leaderboard" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-dark h-full flex flex-col border-r border-white/5 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-gradient-to-br from-primary to-purple-400 rounded-lg flex items-center justify-center shadow-glow-sm">
          <Icon name="school" className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          DSA<span className="text-primary">Trainer</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 mt-auto">
        <div className="bg-surface-light rounded-xl p-4 flex flex-col gap-3 border border-white/5">
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="rounded-full border-2 border-primary"
              />
            ) : (
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                <Icon name="person" className="text-primary" size="sm" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-lg shadow-primary/20 text-center"
          >
            View Profile
          </Link>
        </div>
      </div>
    </aside>
  );
}
