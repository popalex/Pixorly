"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface GenerationStatusProps {
  jobId: Id<"generationJobs">;
  onComplete?: () => void;
}

export function GenerationStatus({ jobId, onComplete }: GenerationStatusProps) {
  const job = useQuery(api.generations.getGenerationJob, { jobId });

  // Call onComplete when job is done
  if (job && (job.status === "completed" || job.status === "failed") && onComplete) {
    // Use setTimeout to avoid calling setState during render
    setTimeout(onComplete, 0);
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Generation Status</h3>
        <StatusBadge status={job.status} />
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{getProgressPercentage(job.status)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(job.status)}`}
            style={{ width: `${getProgressPercentage(job.status)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-700">{getStatusMessage(job.status)}</p>
      </div>

      {/* Job Details */}
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Model:</span>
          <span className="font-medium text-gray-700">{job.model}</span>
        </div>
        <div className="flex justify-between">
          <span>Resolution:</span>
          <span className="font-medium text-gray-700">
            {job.width}x{job.height}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cost:</span>
          <span className="font-medium text-gray-700">{job.creditsUsed} credits</span>
        </div>
        {job.completedAt && (
          <div className="flex justify-between">
            <span>Completed:</span>
            <span className="font-medium text-gray-700">
              {new Date(job.completedAt).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {job.status === "failed" && job.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {job.error}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
    succeeded: { label: "Completed", color: "bg-green-100 text-green-800" },
    failed: { label: "Failed", color: "bg-red-100 text-red-800" },
  }[status] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

function getProgressPercentage(status: string): number {
  switch (status) {
    case "pending":
      return 10;
    case "processing":
      return 50;
    case "uploading":
      return 75;
    case "completed":
      return 100;
    case "failed":
      return 100;
    default:
      return 0;
  }
}

function getProgressColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "processing":
      return "bg-blue-500";
    case "uploading":
      return "bg-indigo-500";
    case "completed":
      return "bg-green-500";
    case "failed":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Your generation request is queued and will start processing shortly...";
    case "processing":
      return "AI is creating your image. This may take 30-60 seconds...";
    case "uploading":
      return "Uploading your image to storage...";
    case "completed":
      return "Your image has been generated successfully!";
    case "failed":
      return "Generation failed. Please try again or contact support if the problem persists.";
    default:
      return "Unknown status";
  }
}
