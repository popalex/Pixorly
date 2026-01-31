"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UsageHistory() {
  const stats = useQuery(api.users.getUserUsageStats);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
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
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        processing: "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
        uploading: "bg-purple-100 text-purple-800",
      }[status] || "bg-gray-100 text-gray-800";

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${config}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total Images</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalImages}</p>
        </div>

        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Successful Generations</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.successfulGenerations}</p>
        </div>

        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Failed Generations</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.failedGenerations}</p>
        </div>

        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Images (Last 30 Days)</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.imagesLast30Days}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="mb-4 font-semibold text-gray-900">Recent Activity</h4>

        {stats.recentJobs.length === 0 ? (
          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-500">No generation history yet</p>
            <p className="mt-1 text-sm text-gray-400">Your recent generations will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentJobs.map((job) => (
              <div
                key={job._id}
                className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{job.prompt}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>Model: {job.model.split("/").pop()}</span>
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
                    <p className="mt-1 text-xs text-gray-400">{formatDate(job.createdAt)}</p>
                  </div>
                  <div className="ml-4">{getStatusBadge(job.status)}</div>
                </div>

                {job.error && (
                  <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
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
