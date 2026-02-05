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
    <div className="space-y-4">
      <label className="block font-medium text-text-primary">
        Model
        <span className="ml-1 text-accent">*</span>
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODEL_OPTIONS.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => !disabled && onChange(model.id)}
            disabled={disabled}
            className={`border-gradient relative rounded-xl p-5 text-left transition-all duration-300 ${
              selected === model.id
                ? "bg-accent/10 ring-2 ring-accent"
                : "bg-bg-tertiary hover:bg-bg-elevated"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-[1.02]"} `}
          >
            {/* Recommended Badge */}
            {model.recommended && (
              <span className="absolute -right-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-body-xs font-semibold text-bg-primary shadow-glow">
                Recommended
              </span>
            )}

            {/* Model Name */}
            <h3 className="mb-1 font-semibold text-text-primary">{model.name}</h3>

            {/* Description */}
            <p className="mb-4 text-body-xs text-text-secondary">{model.description}</p>

            {/* Metadata */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-body-xs">
                <span className="text-text-tertiary">Cost:</span>
                <span className="font-medium text-text-primary">{model.cost} credits</span>
              </div>
              <div className="flex items-center justify-between text-body-xs">
                <span className="text-text-tertiary">Speed:</span>
                <span
                  className={`font-medium capitalize ${model.speed === "fast" ? "text-success" : ""} ${model.speed === "medium" ? "text-warning" : ""} ${model.speed === "slow" ? "text-accent" : ""} `}
                >
                  {model.speed}
                </span>
              </div>
              <div className="flex items-center justify-between text-body-xs">
                <span className="text-text-tertiary">Quality:</span>
                <span
                  className={`font-medium capitalize ${model.quality === "premium" ? "text-accent" : ""} ${model.quality === "high" ? "text-success" : ""} ${model.quality === "standard" ? "text-text-secondary" : ""} `}
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
