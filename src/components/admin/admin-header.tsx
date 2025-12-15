"use client";

import { Icon } from "@/components/ui";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <header className="bg-surface-dark border-b border-white/5 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Icon name="admin_panel_settings" className="text-orange-400" />
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-muted mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
