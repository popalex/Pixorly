"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AccountSettingsProps {
  emailNotifications: boolean;
  defaultModel?: string;
}

export function AccountSettings({
  emailNotifications: initialEmailNotifications,
  defaultModel: initialDefaultModel,
}: AccountSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [defaultModel, setDefaultModel] = useState(initialDefaultModel || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const updateSettings = useMutation(api.users.updateUserSettings);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      await updateSettings({
        emailNotifications,
        defaultModel: defaultModel || undefined,
      });

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Failed to save settings. Please try again.");
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    emailNotifications !== initialEmailNotifications || defaultModel !== initialDefaultModel;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl text-text-primary">Settings</h3>

      {/* Email Notifications */}
      <div className="flex items-center justify-between rounded-xl bg-bg-tertiary p-4">
        <div>
          <label htmlFor="email-notifications" className="font-medium text-text-primary">
            Email Notifications
          </label>
          <p className="text-body-sm text-text-secondary">
            Receive updates about your generations and account
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            id="email-notifications"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer-focus:ring-accent/50 peer h-6 w-11 rounded-full bg-bg-elevated after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-text-tertiary after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:bg-bg-primary peer-focus:outline-none peer-focus:ring-2"></div>
        </label>
      </div>

      {/* Default Model */}
      <div className="rounded-xl bg-bg-tertiary p-4">
        <label htmlFor="default-model" className="mb-2 block font-medium text-text-primary">
          Default Model
        </label>
        <p className="mb-3 text-body-sm text-text-secondary">
          Choose your preferred model for image generation
        </p>
        <select
          id="default-model"
          value={defaultModel}
          onChange={(e) => setDefaultModel(e.target.value)}
          className="focus:ring-accent/20 w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2"
        >
          <option value="">No preference</option>
          <option value="openai/dall-e-3">DALL-E 3</option>
          <option value="stability-ai/sdxl">SDXL</option>
          <option value="midjourney/midjourney-v6">Midjourney v6</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>

        {saveMessage && (
          <span
            className={`text-body-sm ${
              saveMessage.includes("success") ? "text-success" : "text-error"
            }`}
          >
            {saveMessage}
          </span>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border-error/30 bg-error/5 rounded-xl border p-4">
        <h4 className="mb-2 font-semibold text-error">Danger Zone</h4>
        <p className="mb-3 text-body-sm text-text-secondary">
          Deleting your account will permanently remove all your images, generations, and data. This
          action cannot be undone.
        </p>
        <button className="border-error/50 hover:bg-error/10 rounded-lg border bg-transparent px-4 py-2 text-body-sm font-semibold text-error transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
