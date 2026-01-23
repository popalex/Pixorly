"use client";

import { ChangeEvent } from "react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  negativePrompt?: string;
  onNegativePromptChange?: (value: string) => void;
  disabled?: boolean;
  showAdvanced?: boolean;
}

export function PromptInput({
  value,
  onChange,
  negativePrompt,
  onNegativePromptChange,
  disabled = false,
  showAdvanced = false,
}: PromptInputProps) {
  return (
    <div className="space-y-4">
      {/* Main Prompt */}
      <div>
        <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-gray-700">
          Prompt
          <span className="ml-1 text-red-500">*</span>
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Describe the image you want to generate..."
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          disabled={disabled}
          required
        />
        <p className="mt-2 text-xs text-gray-500">
          Be descriptive and specific for best results. Example: &quot;A serene mountain landscape
          at sunset with pine trees in the foreground&quot;
        </p>
      </div>

      {/* Negative Prompt (Advanced) */}
      {showAdvanced && onNegativePromptChange && (
        <div>
          <label htmlFor="negativePrompt" className="mb-2 block text-sm font-medium text-gray-700">
            Negative Prompt
            <span className="ml-2 text-xs font-normal text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="negativePrompt"
            rows={2}
            className="w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="What to avoid in the image..."
            value={negativePrompt || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onNegativePromptChange(e.target.value)
            }
            disabled={disabled}
          />
          <p className="mt-2 text-xs text-gray-500">
            Specify what you don&apos;t want in the image (e.g., &quot;blurry, low quality,
            watermark&quot;)
          </p>
        </div>
      )}
    </div>
  );
}
