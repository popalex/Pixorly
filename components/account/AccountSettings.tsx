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
      <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

      {/* Email Notifications */}
      <div className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4">
        <div>
          <label htmlFor="email-notifications" className="font-medium text-gray-900">
            Email Notifications
          </label>
          <p className="text-sm text-gray-500">
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
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
        </label>
      </div>

      {/* Default Model */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
        <label htmlFor="default-model" className="mb-2 block font-medium text-gray-900">
          Default Model
        </label>
        <p className="mb-3 text-sm text-gray-500">
          Choose your preferred model for image generation
        </p>
        <select
          id="default-model"
          value={defaultModel}
          onChange={(e) => setDefaultModel(e.target.value)}
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
          className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>

        {saveMessage && (
          <span
            className={`text-sm ${
              saveMessage.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {saveMessage}
          </span>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
        <h4 className="mb-2 font-semibold text-red-900">Danger Zone</h4>
        <p className="mb-3 text-sm text-red-700">
          Deleting your account will permanently remove all your images, generations, and data. This
          action cannot be undone.
        </p>
        <button className="rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50">
          Delete Account
        </button>
      </div>
    </div>
  );
}
