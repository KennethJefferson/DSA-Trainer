"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Icon } from "@/components/ui";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Placeholder for settings save logic
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Settings saved successfully");
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-text-muted mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="person" className="text-primary" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Display Name"
              defaultValue={session?.user?.name || ""}
              disabled
              placeholder="Your display name"
            />
            <Input
              label="Email"
              type="email"
              defaultValue={session?.user?.email || ""}
              disabled
              placeholder="your@email.com"
            />
            <p className="text-xs text-text-muted">
              Account details are managed through your OAuth provider.
            </p>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="tune" className="text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-text-muted">Receive updates about your progress</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-light">
                <span className="inline-block h-4 w-4 transform rounded-full bg-text-muted transition translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Sound Effects</p>
                <p className="text-xs text-text-muted">Play sounds for quiz interactions</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
