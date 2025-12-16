"use client";

import { useState } from "react";
import { Icon, Button } from "@/components/ui";
import { toast } from "sonner";

interface ProfileSettingsFormProps {
  user: {
    name: string | null;
    email?: string;
    username?: string;
    location?: string;
    bio?: string;
  };
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [formData, setFormData] = useState({
    username: user.username || user.email?.split("@")[0] || "",
    email: user.email || "",
    fullname: user.name || "",
    location: user.location || "",
    bio: user.bio || "",
    emailNotifications: true,
    publicProfile: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate save - in a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white text-xl font-bold">Profile Settings</h3>
          <p className="text-text-muted text-sm">Update your photo and personal details.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="alternate_email" className="text-text-muted text-lg" />
              </div>
              <input
                className="block w-full pl-10 rounded-lg border border-border-dark bg-background text-white focus:ring-primary focus:border-primary placeholder-gray-500 text-sm py-2.5"
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="mail" className="text-text-muted text-lg" />
              </div>
              <input
                className="block w-full pl-10 rounded-lg border border-border-dark bg-background text-white focus:ring-primary focus:border-primary placeholder-gray-500 text-sm py-2.5"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted" htmlFor="fullname">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="person" className="text-text-muted text-lg" />
              </div>
              <input
                className="block w-full pl-10 rounded-lg border border-border-dark bg-background text-white focus:ring-primary focus:border-primary placeholder-gray-500 text-sm py-2.5"
                id="fullname"
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted" htmlFor="location">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="location_on" className="text-text-muted text-lg" />
              </div>
              <input
                className="block w-full pl-10 rounded-lg border border-border-dark bg-background text-white focus:ring-primary focus:border-primary placeholder-gray-500 text-sm py-2.5"
                id="location"
                type="text"
                placeholder="New York, USA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted" htmlFor="bio">
            Bio
          </label>
          <textarea
            className="block w-full rounded-lg border border-border-dark bg-background text-white focus:ring-primary focus:border-primary placeholder-gray-500 text-sm p-3"
            id="bio"
            placeholder="Tell us a little about yourself..."
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        {/* Notifications & Privacy */}
        <div className="border-t border-border-dark my-6 pt-6">
          <h4 className="text-white text-base font-bold mb-4">Notifications & Privacy</h4>
          <div className="space-y-4">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Email Notifications</span>
                <span className="text-xs text-text-muted">Receive weekly progress reports and badge alerts.</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.emailNotifications}
                onClick={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${
                  formData.emailNotifications ? "bg-primary" : "bg-border-dark"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.emailNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Public Profile</span>
                <span className="text-xs text-text-muted">Allow others to see your badges and rank.</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.publicProfile}
                onClick={() => setFormData({ ...formData, publicProfile: !formData.publicProfile })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${
                  formData.publicProfile ? "bg-primary" : "bg-border-dark"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.publicProfile ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
