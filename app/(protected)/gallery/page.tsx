"use client";

import { Header } from "@/components/layout/Header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function GalleryPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

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
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-display text-display-md text-text-primary">Gallery</h1>
            <p className="mt-2 text-body-lg text-text-secondary">
              Your collection of generated artwork
            </p>
          </div>

          {currentUser && (
            <div className="text-right">
              <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
                Storage Used
              </p>
              <p className="mt-1">
                <span className="font-display text-xl text-text-primary">
                  {(currentUser.storageUsedBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
                <span className="text-body-sm text-text-tertiary">
                  {" "}
                  / {(currentUser.storageQuotaBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Empty State */}
        <div className="border-gradient rounded-2xl bg-bg-secondary">
          <div className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
            {/* Icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-muted">
              <svg
                className="h-10 w-10 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>

            <h2 className="font-display text-display-sm text-text-primary">Your gallery awaits</h2>
            <p className="mt-2 max-w-md text-body-lg text-text-secondary">
              Gallery functionality coming in Phase 4. Start generating images to build your
              collection.
            </p>

            <a
              href="/generate"
              className="bg-accent-gradient group mt-8 inline-flex items-center gap-3 rounded-xl px-8 py-4 font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_var(--accent-glow)]"
            >
              <span>Start Creating</span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Placeholder Grid */}
        <div className="mt-10">
          <h3 className="mb-6 font-display text-xl text-text-primary">Recent Creations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-gradient aspect-square rounded-2xl bg-bg-tertiary">
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 rounded-lg bg-bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
