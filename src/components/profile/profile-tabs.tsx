"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "achievements", label: "Achievements", icon: "military_tech" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "billing", label: "Billing", icon: "receipt_long" },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-border-dark">
      <nav aria-label="Tabs" className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-white"
                : "border-transparent text-text-muted hover:text-white hover:border-gray-500"
            )}
          >
            <Icon name={tab.icon} className="text-[20px]" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
