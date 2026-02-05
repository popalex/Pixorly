"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export function UsageHistory() {
  const { isSignedIn, isLoaded } = useAuth();
  const stats = useQuery(api.users.getUserUsageStats, isLoaded && isSignedIn ? {} : "skip");

  if (!isLoaded || !stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config =
      {
        completed: "bg-success/20 text-success",
        failed: "bg-error/20 text-error",
        processing: "bg-accent/20 text-accent",
        pending: "bg-warning/20 text-warning",
        uploading: "bg-accent/20 text-accent",
      }[status] || "bg-bg-tertiary text-text-secondary";

    return (
      <span className={`rounded-full px-2.5 py-1 text-body-xs font-semibold ${config}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl text-text-primary">Usage Statistics</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-bg-tertiary p-4">
          <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
            Total Images
          </p>
          <p className="mt-1 font-display text-display-sm text-text-primary">{stats.totalImages}</p>
        </div>

        <div className="rounded-xl bg-bg-tertiary p-4">
          <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
            Successful
          </p>
          <p className="mt-1 font-display text-display-sm text-success">
            {stats.successfulGenerations}
          </p>
        </div>

        <div className="rounded-xl bg-bg-tertiary p-4">
          <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
            Failed
          </p>
          <p className="mt-1 font-display text-display-sm text-error">{stats.failedGenerations}</p>
        </div>

        <div className="rounded-xl bg-bg-tertiary p-4">
          <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
            Last 30 Days
          </p>
          <p className="mt-1 font-display text-display-sm text-accent">{stats.imagesLast30Days}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="mb-4 font-medium text-text-primary">Recent Activity</h4>

        {stats.recentJobs.length === 0 ? (
          <div className="rounded-xl bg-bg-tertiary p-8 text-center">
            <p className="text-text-secondary">No generation history yet</p>
            <p className="mt-1 text-body-sm text-text-tertiary">
              Your recent generations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentJobs.map((job) => (
              <div
                key={job._id}
                className="rounded-xl bg-bg-tertiary p-4 transition-colors hover:bg-bg-elevated"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{job.prompt}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-body-sm text-text-tertiary">
                      <span>{job.model.split("/").pop()}</span>
                      <span>•</span>
                      <span>
                        {job.width}x{job.height}
                      </span>
                      <span>•</span>
                      <span>{job.creditsUsed} credits</span>
                      {job.numImages > 1 && (
                        <>
                          <span>•</span>
                          <span>{job.numImages} images</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-body-xs text-text-muted">{formatDate(job.createdAt)}</p>
                  </div>
                  <div className="ml-4">{getStatusBadge(job.status)}</div>
                </div>

                {job.error && (
                  <div className="bg-error/10 mt-2 rounded-lg p-2 text-body-sm text-error">
                    Error: {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
