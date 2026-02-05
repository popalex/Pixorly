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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-primary">Generation Status</h3>
        <StatusBadge status={job.status} />
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-body-sm text-text-secondary">
          <span>Progress</span>
          <span className="font-medium">{getProgressPercentage(job.status)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(job.status)}`}
            style={{ width: `${getProgressPercentage(job.status)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="rounded-xl bg-bg-tertiary p-4">
        <p className="text-body-sm text-text-secondary">{getStatusMessage(job.status)}</p>
      </div>

      {/* Job Details */}
      <div className="space-y-2 text-body-xs">
        <div className="flex justify-between">
          <span className="text-text-tertiary">Model:</span>
          <span className="font-medium text-text-primary">{job.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-tertiary">Resolution:</span>
          <span className="font-medium text-text-primary">
            {job.width}x{job.height}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-tertiary">Cost:</span>
          <span className="font-medium text-accent">{job.creditsUsed} credits</span>
        </div>
        {job.completedAt && (
          <div className="flex justify-between">
            <span className="text-text-tertiary">Completed:</span>
            <span className="font-medium text-text-primary">
              {new Date(job.completedAt).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {job.status === "failed" && job.error && (
        <div className="border-error/30 bg-error/10 rounded-xl border p-4">
          <p className="text-body-sm text-error">
            <strong>Error:</strong> {job.error}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: "Pending", color: "bg-warning/20 text-warning" },
    processing: { label: "Processing", color: "bg-accent/20 text-accent" },
    succeeded: { label: "Completed", color: "bg-success/20 text-success" },
    failed: { label: "Failed", color: "bg-error/20 text-error" },
  }[status] || { label: status, color: "bg-bg-tertiary text-text-secondary" };

  return (
    <span className={`rounded-full px-3 py-1 text-body-xs font-semibold ${config.color}`}>
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
      return "bg-warning";
    case "processing":
      return "bg-accent";
    case "uploading":
      return "bg-accent-hover";
    case "completed":
      return "bg-success";
    case "failed":
      return "bg-error";
    default:
      return "bg-text-muted";
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
