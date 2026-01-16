"use client";

import { Header } from "@/components/layout/Header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function GeneratePage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Generate Images</h1>

        {currentUser && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">
              Welcome, {currentUser.firstName || currentUser.email}!
            </p>
            <p className="text-sm text-gray-600">
              Credits: <span className="font-semibold">{currentUser.credits}</span>
            </p>
            <p className="text-sm text-gray-600">
              Plan: <span className="font-semibold capitalize">{currentUser.plan}</span>
            </p>
          </div>
        )}

        <div className="rounded-lg bg-white p-8 shadow">
          <p className="text-gray-600">
            Image generation functionality will be implemented in Phase 2.
          </p>
        </div>
      </main>
    </div>
  );
}
