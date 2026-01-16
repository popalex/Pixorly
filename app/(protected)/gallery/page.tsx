"use client";

import { Header } from "@/components/layout/Header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function GalleryPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Gallery</h1>

        {currentUser && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">
              Storage Used:{" "}
              <span className="font-semibold">
                {(currentUser.storageUsedBytes / (1024 * 1024)).toFixed(2)} MB
              </span>{" "}
              /{" "}
              <span className="font-semibold">
                {(currentUser.storageQuotaBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
              </span>
            </p>
          </div>
        )}

        <div className="rounded-lg bg-white p-8 shadow">
          <p className="text-gray-600">Gallery functionality will be implemented in Phase 4.</p>
        </div>
      </main>
    </div>
  );
}
