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
    <div className="relative min-h-screen bg-bg-primary">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250, 250, 249, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250, 250, 249, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <Header />

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-display text-display-md text-text-primary">Create</h1>
          <p className="mt-2 text-body-lg text-text-secondary">
            Transform your ideas into stunning visuals
          </p>
        </div>

        {/* User Stats Bar */}
        {currentUser && (
          <div className="border-gradient mb-10 rounded-2xl bg-bg-secondary p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-10">
                <div>
                  <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
                    Credits
                  </p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-display-sm text-text-primary">
                      {currentUser.credits}
                    </span>
                    <span className="text-body-sm text-text-tertiary">available</span>
                  </p>
                </div>
                <div className="border-l border-border-subtle pl-10">
                  <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
                    Plan
                  </p>
                  <p className="mt-1 font-display text-display-sm capitalize text-text-primary">
                    {currentUser.plan}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {currentUser.credits < 100 && (
                  <a
                    href="/billing"
                    className="rounded-xl border border-accent bg-accent-muted px-6 py-3 text-body-sm font-semibold text-accent transition-all duration-300 hover:bg-accent hover:text-bg-primary"
                  >
                    Add Credits
                  </a>
                )}
                <button
                  onClick={handleAddTestCredits}
                  className="rounded-xl border border-border bg-bg-tertiary px-6 py-3 text-body-sm font-medium text-text-secondary transition-all duration-300 hover:border-accent hover:text-accent"
                  type="button"
                >
                  🧪 Add Test Credits
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Error Messages */}
        {hasInsufficientCredits && (
          <div className="border-error/30 bg-error/10 mb-8 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-error/20 flex-shrink-0 rounded-full p-1">
                <svg
                  className="h-5 w-5 text-error"
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
              <p className="text-body-sm font-medium text-error">
                Insufficient credits. Required: {estimatedCost}, Available:{" "}
                {currentUser?.credits || 0}
              </p>
            </div>
          </div>
        )}

        {error && !hasInsufficientCredits && (
          <div className="border-error/30 bg-error/10 mb-8 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-error/20 flex-shrink-0 rounded-full p-1">
                <svg
                  className="h-5 w-5 text-error"
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
              <p className="flex-1 text-body-sm font-medium text-error">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-error/70 flex-shrink-0 transition-colors hover:text-error"
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Generation Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                <PromptInput
                  value={prompt}
                  onChange={setPrompt}
                  negativePrompt={negativePrompt}
                  onNegativePromptChange={setNegativePrompt}
                  disabled={isGenerating}
                  showAdvanced={showAdvanced}
                />
              </div>

              <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                <ModelSelector
                  selected={selectedModel}
                  onChange={setSelectedModel}
                  disabled={isGenerating}
                />
              </div>

              <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-xl text-text-primary">Parameters</h2>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-body-sm font-medium text-accent transition-colors hover:text-accent-hover"
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

              {/* Submit Section */}
              <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
                      Estimated Cost
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-display-sm text-text-primary">
                        {estimatedCost}
                      </span>
                      <span className="text-body-sm text-text-tertiary">credits</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim() || hasInsufficientCredits}
                    className="bg-accent-gradient group inline-flex items-center gap-3 rounded-xl px-8 py-4 font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_var(--accent-glow)] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate</span>
                        <svg
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                {!prompt.trim() && (
                  <p className="mt-4 text-body-xs text-text-tertiary">
                    Enter a prompt to start generating
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Status and Results Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {currentJobId && (
                <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                  <GenerationStatus jobId={currentJobId} onComplete={handleGenerationComplete} />
                </div>
              )}

              {currentJobId && !isGenerating && (
                <>
                  <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                    <GenerationResult jobId={currentJobId} />
                  </div>

                  <button
                    onClick={startNewGeneration}
                    className="bg-success/10 w-full rounded-xl border border-success px-4 py-4 font-semibold text-success transition-all duration-300 hover:bg-success hover:text-bg-primary"
                  >
                    Start New Generation
                  </button>
                </>
              )}

              {!currentJobId && (
                <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
                  <h3 className="mb-4 font-display text-xl text-text-primary">Pro Tips</h3>
                  <ul className="space-y-3">
                    {[
                      "Be specific and descriptive in your prompts",
                      "Include details about style, lighting, and mood",
                      "Use negative prompts to avoid unwanted elements",
                      "Higher steps = better quality but slower generation",
                    ].map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-body-sm text-text-secondary"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                        <span>{tip}</span>
                      </li>
                    ))}
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
