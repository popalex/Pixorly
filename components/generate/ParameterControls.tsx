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
        <label className="mb-3 block text-sm font-medium text-gray-700">Resolution</label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {RESOLUTION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setResolution(preset.width, preset.height)}
              disabled={disabled}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold shadow-sm transition-all ${
                params.width === preset.width && params.height === preset.height
                  ? "border-blue-500 bg-blue-600 text-white shadow-md"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02]"} `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Images */}
      <div>
        <label htmlFor="numOutputs" className="mb-2 block text-sm font-medium text-gray-700">
          Number of Images
        </label>
        <select
          id="numOutputs"
          value={params.numOutputs || 1}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            updateParam("numOutputs", parseInt(e.target.value))
          }
          disabled={disabled}
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value={1} className="text-gray-900">
            1 image
          </option>
          <option value={2} className="text-gray-900">
            2 images
          </option>
          <option value={3} className="text-gray-900">
            3 images
          </option>
          <option value={4} className="text-gray-900">
            4 images
          </option>
        </select>
      </div>

      {/* Advanced Parameters */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Advanced Settings</h3>

          {/* Steps */}
          <div>
            <label htmlFor="steps" className="mb-2 block text-sm font-medium text-gray-700">
              Inference Steps: {params.steps || 20}
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
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Faster</span>
              <span>Higher Quality</span>
            </div>
          </div>

          {/* Guidance Scale */}
          <div>
            <label htmlFor="guidanceScale" className="mb-2 block text-sm font-medium text-gray-700">
              Guidance Scale: {params.guidanceScale || 7.5}
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
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Creative</span>
              <span>Strict</span>
            </div>
          </div>

          {/* Seed */}
          <div>
            <label htmlFor="seed" className="mb-2 block text-sm font-medium text-gray-700">
              Seed
              <span className="ml-2 text-xs font-normal text-gray-500">
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
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use the same seed to reproduce images with identical settings
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
