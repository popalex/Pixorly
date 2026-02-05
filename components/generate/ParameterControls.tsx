"use client";

import { GenerationParams } from "@/lib/ai/types";
import { ChangeEvent } from "react";

interface ParameterControlsProps {
  params: GenerationParams;
  onChange: (params: GenerationParams) => void;
  disabled?: boolean;
  showAdvanced?: boolean;
}

const RESOLUTION_PRESETS = [
  { label: "Square (1024x1024)", width: 1024, height: 1024 },
  { label: "Portrait (1024x1792)", width: 1024, height: 1792 },
  { label: "Landscape (1792x1024)", width: 1792, height: 1024 },
];

export function ParameterControls({
  params,
  onChange,
  disabled = false,
  showAdvanced = false,
}: ParameterControlsProps) {
  const updateParam = <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  const setResolution = (width: number, height: number) => {
    onChange({ ...params, width, height });
  };

  return (
    <div className="space-y-6">
      {/* Resolution Presets */}
      <div>
        <label className="mb-3 block font-medium text-text-primary">Resolution</label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {RESOLUTION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setResolution(preset.width, preset.height)}
              disabled={disabled}
              className={`rounded-xl border px-4 py-3 text-body-sm font-semibold transition-all duration-300 ${
                params.width === preset.width && params.height === preset.height
                  ? "border-accent bg-accent text-bg-primary shadow-glow"
                  : "border-border bg-bg-tertiary text-text-secondary hover:border-accent hover:text-accent"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02]"} `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Images */}
      <div>
        <label htmlFor="numOutputs" className="mb-2 block font-medium text-text-primary">
          Number of Images
        </label>
        <select
          id="numOutputs"
          value={params.numOutputs || 1}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            updateParam("numOutputs", parseInt(e.target.value))
          }
          disabled={disabled}
          className="focus:ring-accent/20 w-full rounded-xl border border-border bg-bg-tertiary px-4 py-3 font-medium text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value={1}>1 image</option>
          <option value={2}>2 images</option>
          <option value={3}>3 images</option>
          <option value={4}>4 images</option>
        </select>
      </div>

      {/* Advanced Parameters */}
      {showAdvanced && (
        <div className="space-y-5 border-t border-border-subtle pt-5">
          <h3 className="text-body-sm font-semibold text-text-primary">Advanced Settings</h3>

          {/* Steps */}
          <div>
            <label htmlFor="steps" className="mb-2 block text-body-sm text-text-secondary">
              Inference Steps:{" "}
              <span className="font-medium text-text-primary">{params.steps || 20}</span>
            </label>
            <input
              type="range"
              id="steps"
              min={10}
              max={50}
              step={5}
              value={params.steps || 20}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateParam("steps", parseInt(e.target.value))
              }
              disabled={disabled}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-body-xs text-text-tertiary">
              <span>Faster</span>
              <span>Higher Quality</span>
            </div>
          </div>

          {/* Guidance Scale */}
          <div>
            <label htmlFor="guidanceScale" className="mb-2 block text-body-sm text-text-secondary">
              Guidance Scale:{" "}
              <span className="font-medium text-text-primary">{params.guidanceScale || 7.5}</span>
            </label>
            <input
              type="range"
              id="guidanceScale"
              min={1}
              max={20}
              step={0.5}
              value={params.guidanceScale || 7.5}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateParam("guidanceScale", parseFloat(e.target.value))
              }
              disabled={disabled}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-body-xs text-text-tertiary">
              <span>Creative</span>
              <span>Strict</span>
            </div>
          </div>

          {/* Seed */}
          <div>
            <label htmlFor="seed" className="mb-2 block text-body-sm text-text-secondary">
              Seed
              <span className="ml-2 text-body-xs text-text-tertiary">
                (Optional - for reproducibility)
              </span>
            </label>
            <input
              type="number"
              id="seed"
              placeholder="Random"
              value={params.seed || ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateParam("seed", e.target.value ? parseInt(e.target.value) : undefined)
              }
              disabled={disabled}
              className="focus:ring-accent/20 w-full rounded-xl border border-border bg-bg-tertiary px-4 py-2.5 text-text-primary transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 text-body-xs text-text-tertiary">
              Use the same seed to reproduce images with identical settings
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
