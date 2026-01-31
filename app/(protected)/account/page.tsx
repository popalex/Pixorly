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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account</h1>
            <p className="mt-2 text-gray-600">Manage your profile, settings, and subscription</p>
          </div>

          {/* Profile Section */}
          <div className="mb-8 rounded-lg border-2 border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              {clerkUser?.imageUrl && (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200">
                  <Image src={clerkUser.imageUrl} alt="Profile" fill className="object-cover" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username || "User"}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Plan & Credits */}
            <div className="space-y-8 lg:col-span-1">
              {/* Credit Balance */}
              <CreditBalance credits={user.credits} plan={user.plan} />

              {/* Plan Information */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
                <PlanInformation
                  plan={user.plan}
                  subscriptionStatus={user.subscriptionStatus}
                  trialEndsAt={user.trialEndsAt}
                />
              </div>

              {/* Storage Usage */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Storage</h3>
                <StorageUsageMeter
                  usedBytes={user.storageUsedBytes}
                  quotaBytes={user.storageQuotaBytes}
                />
              </div>
            </div>

            {/* Right Column - Settings & History */}
            <div className="space-y-8 lg:col-span-2">
              {/* Account Settings */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
                <AccountSettings
                  emailNotifications={user.emailNotifications}
                  defaultModel={user.defaultModel}
                />
              </div>

              {/* Usage History */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
                <UsageHistory />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
