"use client";

import { AIModel } from "@/lib/ai/types";

interface ModelOption {
  id: AIModel;
  name: string;
  description: string;
  cost: number;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "premium";
  recommended?: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: AIModel.FLUX_PRO,
    name: "FLUX.2 Pro",
    description: "Black Forest Labs premium model - highest quality",
    cost: 100,
    speed: "medium",
    quality: "premium",
    recommended: true,
  },
  {
    id: AIModel.FLUX_MAX,
    name: "FLUX.2 Max",
    description: "Maximum quality - best for professional work",
    cost: 120,
    speed: "slow",
    quality: "premium",
  },
  {
    id: AIModel.FLUX_FLEX,
    name: "FLUX.2 Flex",
    description: "Flexible model - balanced quality and speed",
    cost: 80,
    speed: "medium",
    quality: "high",
  },
  {
    id: AIModel.FLUX_KLEIN,
    name: "FLUX.2 Klein 4B",
    description: "Fast 4B model - excellent quality at lower cost",
    cost: 40,
    speed: "fast",
    quality: "high",
  },
  {
    id: AIModel.RIVERFLOW_FAST,
    name: "Riverflow V2 Fast",
    description: "Sourceful's fast model - budget friendly",
    cost: 30,
    speed: "fast",
    quality: "standard",
  },
  {
    id: AIModel.RIVERFLOW_STANDARD,
    name: "Riverflow V2 Standard",
    description: "Balanced speed and quality",
    cost: 50,
    speed: "medium",
    quality: "high",
  },
];

interface ModelSelectorProps {
  selected: AIModel;
  onChange: (model: AIModel) => void;
  disabled?: boolean;
}

export function ModelSelector({ selected, onChange, disabled = false }: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Model
        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODEL_OPTIONS.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => !disabled && onChange(model.id)}
            disabled={disabled}
            className={`relative rounded-xl border-2 p-5 text-left shadow-sm transition-all ${
              selected === model.id
                ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02]"} `}
          >
            {/* Recommended Badge */}
            {model.recommended && (
              <span className="absolute -right-2 -top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                Recommended
              </span>
            )}

            {/* Model Name */}
            <h3 className="mb-1 font-semibold text-gray-900">{model.name}</h3>

            {/* Description */}
            <p className="mb-3 text-xs text-gray-600">{model.description}</p>

            {/* Metadata */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Cost:</span>
                <span className="font-medium text-gray-900">{model.cost} credits</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Speed:</span>
                <span
                  className={`font-medium capitalize ${model.speed === "fast" ? "text-green-600" : ""} ${model.speed === "medium" ? "text-yellow-600" : ""} ${model.speed === "slow" ? "text-orange-600" : ""} `}
                >
                  {model.speed}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Quality:</span>
                <span
                  className={`font-medium capitalize ${model.quality === "premium" ? "text-purple-600" : ""} ${model.quality === "high" ? "text-blue-600" : ""} ${model.quality === "standard" ? "text-gray-600" : ""} `}
                >
                  {model.quality}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
