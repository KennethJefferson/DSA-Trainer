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
    role?: string;
    xp?: number;
    level?: number;
    streak?: number;
  };
}

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/courses", icon: "book_2", label: "Courses" },
  { href: "/quizzes", icon: "quiz", label: "Quizzes" },
  { href: "/leaderboard", icon: "trophy", label: "Leaderboard" },
  { href: "/community", icon: "forum", label: "Community" },
  { href: "/goals", icon: "flag", label: "Goals" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

const adminNavItems = [
  { href: "/admin", icon: "admin_panel_settings", label: "Admin Panel" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const canAccessAdmin = user.role && ["creator", "admin", "superadmin"].includes(user.role);

  return (
    <aside className="w-64 bg-surface-dark h-full flex flex-col border-r border-white/5 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-gradient-to-br from-primary to-purple-400 rounded-xl flex items-center justify-center shadow-glow-sm">
          <Icon name="school" className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          DSA<span className="text-primary">Trainer</span>
        </h1>
      </div>

      {/* User Stats Bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 px-3 py-2 bg-surface rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">
            <Icon name="bolt" className="text-yellow-400" size="sm" />
            <span className="text-sm font-bold text-white">{user.xp || 0}</span>
            <span className="text-xs text-text-muted">XP</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Icon name="local_fire_department" className="text-orange-400" size="sm" />
            <span className="text-sm font-bold text-white">{user.streak || 0}</span>
            <span className="text-xs text-text-muted">day</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary border-l-4 border-primary -ml-1 pl-5"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon name={item.icon} filled={isActive} size="sm" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.label === "Community" && (
                <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        {canAccessAdmin && (
          <>
            <div className="h-px bg-white/10 my-3 mx-2" />
            <span className="text-xs text-text-muted/60 uppercase tracking-wider px-4 mb-1">
              Admin
            </span>
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-orange-500/15 text-orange-400 border-l-4 border-orange-500 -ml-1 pl-5"
                      : "text-text-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon name={item.icon} filled={isActive} size="sm" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 mt-auto">
        <div className="relative overflow-hidden rounded-xl border border-white/5">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-surface" />

          <div className="relative p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-primary shadow-glow-sm"
                />
              ) : (
                <div className="size-11 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center border-2 border-primary/50 shadow-glow-sm">
                  <Icon name="person" className="text-white" size="sm" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.name || "User"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                    Level {user.level || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Next Level</span>
                <span className="text-white font-medium">
                  {user.xp || 0} / {((user.level || 1) * 100)} XP
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((user.xp || 0) / ((user.level || 1) * 100)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <Link
              href="/profile"
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20 text-center hover:shadow-glow-sm"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
