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
        <label htmlFor="prompt" className="mb-2 block font-medium text-text-primary">
          Prompt
          <span className="ml-1 text-accent">*</span>
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="focus:ring-accent/20 w-full resize-none rounded-xl border border-border bg-bg-tertiary px-4 py-3 text-text-primary transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Describe the image you want to generate..."
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          disabled={disabled}
          required
        />
        <p className="mt-2 text-body-xs text-text-tertiary">
          Be descriptive and specific for best results. Example: &quot;A serene mountain landscape
          at sunset with pine trees in the foreground&quot;
        </p>
      </div>

      {/* Negative Prompt (Advanced) */}
      {showAdvanced && onNegativePromptChange && (
        <div>
          <label htmlFor="negativePrompt" className="mb-2 block font-medium text-text-primary">
            Negative Prompt
            <span className="ml-2 text-body-xs font-normal text-text-tertiary">(Optional)</span>
          </label>
          <textarea
            id="negativePrompt"
            rows={2}
            className="focus:ring-accent/20 w-full resize-none rounded-xl border border-border bg-bg-tertiary px-4 py-3 text-text-primary transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="What to avoid in the image..."
            value={negativePrompt || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onNegativePromptChange(e.target.value)
            }
            disabled={disabled}
          />
          <p className="mt-2 text-body-xs text-text-tertiary">
            Specify what you don&apos;t want in the image (e.g., &quot;blurry, low quality,
            watermark&quot;)
          </p>
        </div>
      )}
    </div>
  );
}
