"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, useAuth } from "@clerk/nextjs";

export default function TestGenerationPage() {
  const { user, isLoaded } = useUser();
  const auth = useAuth();
  const [prompt, setPrompt] = useState("A serene mountain landscape at sunset");
  const [model, setModel] = useState("flux-klein");

  // Debug auth state
  useEffect(() => {
    console.log("Clerk auth state:", {
      isLoaded,
      userId: user?.id,
      getToken: typeof auth.getToken,
    });

    // Try to get token
    if (isLoaded && user) {
      auth.getToken().then((token) => {
        console.log("Clerk token exists:", !!token);
        console.log("Token length:", token?.length);
      });
    }
  }, [isLoaded, user, auth]);

  // Check configuration
  const config = useQuery(api.test.queries.checkConfig);
  const sampleUser = useQuery(api.test.queries.getSampleUser);

  // Generation mutation
  const createJob = useMutation(api.generations.createGenerationJob);
  const resetCredits = useMutation(api.test.mutations.resetCredits);
  const [jobId, setJobId] = useState<Id<"generationJobs"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get job status if we have one
  const job = useQuery(api.generations.getGenerationJob, jobId ? { jobId } : "skip");

  const handleGenerate = async () => {
    try {
      setError(null);
      console.log("About to call mutation, auth state:", {
        isLoaded,
        userId: user?.id,
      });
      const result = await createJob({
        prompt,
        model,
        width: 1024,
        height: 1024,
      });
      setJobId(result.jobId);
    } catch (err) {
      console.error("Mutation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Generation Backend Test</h1>

        {/* Auth Status */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Auth Status</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div>Clerk Loaded: {isLoaded ? "✅" : "❌"}</div>
            <div>User Logged In: {user ? "✅" : "❌"}</div>
            {user && (
              <>
                <div>User ID: {user.id}</div>
                <div>Email: {user.primaryEmailAddress?.emailAddress}</div>
              </>
            )}
            <button
              onClick={() => resetCredits({ amount: 100 })}
              className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Reset Credits to 100
            </button>
          </div>
        </div>

        {/* Configuration Check */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Configuration Status</h2>
          {config ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.allConfigured ? "✅" : "⚠️"}</span>
                <span className="font-medium text-gray-900">
                  {config.allConfigured ? "All configured!" : "Missing configuration"}
                </span>
              </div>

              <div className="space-y-1 pl-8 text-sm text-gray-700">
                <div>Users in DB: {config.database.users}</div>
                <div>Jobs in DB: {config.database.jobs}</div>
                <div className="pt-2 font-medium text-gray-900">Environment Variables:</div>
                <div className="space-y-1 pl-4 text-gray-700">
                  {Object.entries(config.environment).map(([key, value]) => (
                    <div key={key}>
                      {value ? "✅" : "❌"} {key}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Loading...</div>
          )}
        </div>

        {/* Sample User */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Sample User</h2>
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
              <div className="space-y-1 text-sm text-gray-700">
                <div>Email: {sampleUser.email}</div>
                <div>Plan: {sampleUser.plan}</div>
                <div>Credits: {sampleUser.credits}</div>
                <div>
                  Storage: {sampleUser.storageUsed} / {sampleUser.storageQuota}
                </div>
              </div>
            )
          ) : (
            <div className="text-gray-600">Loading...</div>
          )}
        </div>

        {/* Generation Test */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Test Generation</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              >
                <option value="flux-klein">FLUX.2 Klein 4B (Fast & Cheap)</option>
                <option value="riverflow-fast">Riverflow V2 Fast Preview</option>
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
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Job Status</h2>
            {job ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">Status:</span>
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

                <div className="space-y-1 text-sm text-gray-700">
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
              <div className="text-gray-600">Loading job status...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
