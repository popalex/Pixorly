"use client";

import { useState, FormEvent } from "react";
import { Header } from "@/components/layout/Header";
import { PromptInput } from "@/components/generate/PromptInput";
import { ModelSelector } from "@/components/generate/ModelSelector";
import { ParameterControls } from "@/components/generate/ParameterControls";
import { GenerationStatus } from "@/components/generate/GenerationStatus";
import { GenerationResult } from "@/components/generate/GenerationResult";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AIModel } from "@/lib/ai/types";
import { GenerationParams } from "@/lib/ai/types";
import { Id } from "@/convex/_generated/dataModel";

export default function GeneratePage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  // Form state
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.FLUX_PRO);
  const [params, setParams] = useState<GenerationParams>({
    width: 1024,
    height: 1024,
    steps: 20,
    guidanceScale: 7.5,
    numOutputs: 1,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation state
  const [currentJobId, setCurrentJobId] = useState<Id<"generationJobs"> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const createJob = useMutation(api.generations.createGenerationJob);
  const addTestCredits = useMutation(api.users.addTestCredits);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to generate images");
      return;
    }

    const requiredCredits = calculateCost(selectedModel, params.numOutputs || 1);
    if (currentUser.credits < requiredCredits) {
      setError(
        `Insufficient credits. Required: ${requiredCredits}, Available: ${currentUser.credits}. Please upgrade your plan or purchase more credits.`
      );
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createJob({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        model: selectedModel,
        width: params.width,
        height: params.height,
        steps: params.steps,
        guidance: params.guidanceScale,
        seed: params.seed,
        numImages: params.numOutputs,
      });

      setCurrentJobId(result.jobId);
    } catch (error) {
      console.error("Failed to create generation job:", error);
      setError(
        error instanceof Error ? error.message : "Failed to start generation. Please try again."
      );
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
  };

  const startNewGeneration = () => {
    setCurrentJobId(null);
    setError(null);
    setIsGenerating(false);
  };

  const handleAddTestCredits = async () => {
    try {
      const result = await addTestCredits({ amount: 200 });
      alert(`✅ Added 200 test credits! New balance: ${result.newBalance}`);
    } catch (error) {
      console.error("Failed to add test credits:", error);
      alert("Failed to add test credits");
    }
  };

  const estimatedCost = calculateCost(selectedModel, params.numOutputs || 1);
  const hasInsufficientCredits = currentUser ? currentUser.credits < estimatedCost : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Generate Images</h1>
          <p className="text-gray-600">
            Create stunning AI-generated images from text descriptions
          </p>
        </div>

        {/* User Info Card */}
        {currentUser && (
          <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Credits
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{currentUser.credits}</p>
                </div>
                <div className="border-l-2 border-blue-200 pl-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Plan
                  </p>
                  <p className="text-2xl font-bold capitalize text-gray-900">{currentUser.plan}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {currentUser.credits < 100 && (
                  <a
                    href="/billing"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                  >
                    Add Credits
                  </a>
                )}
                <button
                  onClick={handleAddTestCredits}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
                  type="button"
                >
                  🧪 Add 200 Test Credits
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Error Message */}
        {hasInsufficientCredits && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="mt-0.5 h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Insufficient credits. Required: {estimatedCost}, Available:{" "}
                  {currentUser?.credits || 0}. Please upgrade your plan or purchase more credits.
                </p>
              </div>
            </div>
          </div>
        )}
        {error && !hasInsufficientCredits && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="mt-0.5 h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-3 flex-shrink-0 text-red-600 transition-colors hover:text-red-800"
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Generation Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                <PromptInput
                  value={prompt}
                  onChange={setPrompt}
                  negativePrompt={negativePrompt}
                  onNegativePromptChange={setNegativePrompt}
                  disabled={isGenerating}
                  showAdvanced={showAdvanced}
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                <ModelSelector
                  selected={selectedModel}
                  onChange={setSelectedModel}
                  disabled={isGenerating}
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Parameters</h2>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {showAdvanced ? "Hide" : "Show"} Advanced
                  </button>
                </div>
                <ParameterControls
                  params={params}
                  onChange={setParams}
                  disabled={isGenerating}
                  showAdvanced={showAdvanced}
                />
              </div>

              {/* Submit Button */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {estimatedCost} <span className="text-lg text-gray-500">credits</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim() || hasInsufficientCredits}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
                {!prompt.trim() && (
                  <p className="text-xs text-gray-500">Enter a prompt to start generating</p>
                )}
                {hasInsufficientCredits && (
                  <p className="text-xs font-medium text-red-600">
                    Insufficient credits for this generation
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Status and Results Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {currentJobId && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                  <GenerationStatus jobId={currentJobId} onComplete={handleGenerationComplete} />
                </div>
              )}

              {currentJobId && !isGenerating && (
                <>
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
                    <GenerationResult jobId={currentJobId} />
                  </div>

                  <button
                    onClick={startNewGeneration}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                  >
                    Start New Generation
                  </button>
                </>
              )}

              {!currentJobId && (
                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">💡 Pro Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>Be specific and descriptive in your prompts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>Include details about style, lighting, and mood</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>Use negative prompts to avoid unwanted elements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>Higher steps = better quality but slower generation</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function calculateCost(model: AIModel, numImages: number): number {
  const baseCosts: Record<AIModel, number> = {
    [AIModel.FLUX_PRO]: 100,
    [AIModel.FLUX_MAX]: 120,
    [AIModel.FLUX_FLEX]: 80,
    [AIModel.FLUX_KLEIN]: 40,
    [AIModel.RIVERFLOW_FAST]: 30,
    [AIModel.RIVERFLOW_STANDARD]: 50,
    [AIModel.RIVERFLOW_MAX]: 90,
    [AIModel.SEEDREAM]: 25,
  };

  return (baseCosts[model] || 50) * numImages;
}
