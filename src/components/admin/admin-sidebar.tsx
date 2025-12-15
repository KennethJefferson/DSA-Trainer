"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  };
}

const navItems = [
  { href: "/admin", icon: "admin_panel_settings", label: "Dashboard", exact: true },
  { href: "/admin/questions", icon: "help", label: "Questions", exact: false },
  { href: "/admin/quizzes", icon: "quiz", label: "Quizzes", exact: false },
  { href: "/admin/users", icon: "group", label: "Users", exact: false, adminOnly: true },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin" || user.role === "superadmin";

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside className="w-64 bg-surface-dark h-full flex flex-col border-r border-white/5 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
          <Icon name="shield_person" className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Admin
          </h1>
          <p className="text-xs text-text-muted">DSA Trainer</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-2 mt-4 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-white/10 my-4" />

        {/* Back to App */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-all"
        >
          <Icon name="arrow_back" />
          <span className="font-medium text-sm">Back to App</span>
        </Link>
      </nav>

      {/* User Info */}
      <div className="p-4 mt-auto">
        <div className="bg-surface-light rounded-xl p-4 flex items-center gap-3 border border-white/5">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Admin"}
              width={40}
              height={40}
              className="rounded-full border-2 border-orange-500"
            />
          ) : (
            <div className="size-10 rounded-full bg-orange-500/20 flex items-center justify-center border-2 border-orange-500">
              <Icon name="person" className="text-orange-400" size="sm" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {user.name || "Admin"}
            </p>
            <p className="text-xs text-orange-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
