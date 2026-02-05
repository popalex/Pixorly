"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import {
  StorageUsageMeter,
  CreditBalance,
  PlanInformation,
  AccountSettings,
  UsageHistory,
} from "@/components/account";

export default function AccountPage() {
  const { user: clerkUser } = useUser();
  const user = useQuery(api.users.getCurrentUser);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-body-sm text-text-tertiary">Loading...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="font-display text-display-md text-text-primary">Account</h1>
          <p className="mt-2 text-body-lg text-text-secondary">
            Manage your profile, settings, and subscription
          </p>
        </div>

        {/* Profile Section */}
        <div className="border-gradient mb-10 rounded-2xl bg-bg-secondary p-6">
          <div className="flex items-center gap-6">
            {clerkUser?.imageUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-border-subtle">
                <Image src={clerkUser.imageUrl} alt="Profile" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-display text-display-sm text-text-primary">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username || "User"}
              </h2>
              <p className="mt-1 text-body-lg text-text-secondary">{user.email}</p>
              <p className="mt-2 text-body-sm text-text-tertiary">
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Plan & Credits */}
          <div className="space-y-8 lg:col-span-1">
            {/* Credit Balance */}
            <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
              <CreditBalance credits={user.credits} plan={user.plan} />
            </div>

            {/* Plan Information */}
            <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
              <PlanInformation
                plan={user.plan}
                subscriptionStatus={user.subscriptionStatus}
                trialEndsAt={user.trialEndsAt}
              />
            </div>

            {/* Storage Usage */}
            <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
              <h3 className="mb-4 font-display text-xl text-text-primary">Storage</h3>
              <StorageUsageMeter
                usedBytes={user.storageUsedBytes}
                quotaBytes={user.storageQuotaBytes}
              />
            </div>
          </div>

          {/* Right Column - Settings & History */}
          <div className="space-y-8 lg:col-span-2">
            {/* Account Settings */}
            <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
              <AccountSettings
                emailNotifications={user.emailNotifications}
                defaultModel={user.defaultModel}
              />
            </div>

            {/* Usage History */}
            <div className="border-gradient rounded-2xl bg-bg-secondary p-6">
              <UsageHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
