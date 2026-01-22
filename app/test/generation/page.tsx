"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";

export default function TestGenerationPage() {
  const [prompt, setPrompt] = useState("A serene mountain landscape at sunset");
  const [model, setModel] = useState("openai/dall-e-3");

  // Check configuration
  const config = useQuery(api.test.queries.checkConfig);
  const sampleUser = useQuery(api.test.queries.getSampleUser);

  // Generation mutation
  const createJob = useMutation(api.generations.createGenerationJob);
  const [jobId, setJobId] = useState<Id<"generationJobs"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get job status if we have one
  const job = useQuery(api.generations.getGenerationJob, jobId ? { jobId } : "skip");

  const handleGenerate = async () => {
    try {
      setError(null);
      const result = await createJob({
        prompt,
        model,
        width: 1024,
        height: 1024,
      });
      setJobId(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Generation Backend Test</h1>

        {/* Configuration Check */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Configuration Status</h2>
          {config ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${config.allConfigured ? "✅" : "⚠️"}`}>
                  {config.allConfigured ? "✅" : "⚠️"}
                </span>
                <span className="font-medium">
                  {config.allConfigured ? "All configured!" : "Missing configuration"}
                </span>
              </div>

              <div className="space-y-1 pl-8 text-sm">
                <div>Users in DB: {config.database.users}</div>
                <div>Jobs in DB: {config.database.jobs}</div>
                <div className="pt-2 font-medium">Environment Variables:</div>
                <div className="space-y-1 pl-4">
                  {Object.entries(config.environment).map(([key, value]) => (
                    <div key={key}>
                      {value ? "✅" : "❌"} {key}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>

        {/* Sample User */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Sample User</h2>
          {sampleUser ? (
            "error" in sampleUser ? (
              <div className="text-amber-600">
                {sampleUser.error}
                <div className="mt-2 text-sm">
                  Go to{" "}
                  <Link href="/sign-up" className="text-blue-600 underline">
                    /sign-up
                  </Link>{" "}
                  to create a user
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <div>Email: {sampleUser.email}</div>
                <div>Plan: {sampleUser.plan}</div>
                <div>Credits: {sampleUser.credits}</div>
                <div>
                  Storage: {sampleUser.storageUsed} / {sampleUser.storageQuota}
                </div>
              </div>
            )
          ) : (
            <div>Loading...</div>
          )}
        </div>

        {/* Generation Test */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Test Generation</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full rounded-lg border p-3"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option value="openai/dall-e-3">DALL-E 3</option>
                <option value="stability-ai/sdxl">SDXL</option>
                <option value="midjourney">Midjourney</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!config?.allConfigured || !sampleUser || "error" in sampleUser}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Generate Image
            </button>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Job Status */}
        {jobId && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Job Status</h2>
            {job ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : job.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div>Model: {job.model}</div>
                  <div>Credits Used: {job.creditsUsed}</div>
                  <div>Retry Count: {job.retryCount}</div>
                  {job.processingTimeMs && (
                    <div>Processing Time: {Math.round(job.processingTimeMs / 1000)}s</div>
                  )}
                </div>

                {job.error && (
                  <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Error: {job.error}
                  </div>
                )}

                {job.status === "completed" && job.imageIds && (
                  <div className="rounded border border-green-200 bg-green-50 p-3 text-green-700">
                    ✅ Generated {job.imageIds.length} image(s)!
                    <div className="mt-2 text-xs">Image IDs: {job.imageIds.join(", ")}</div>
                  </div>
                )}
              </div>
            ) : (
              <div>Loading job status...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
