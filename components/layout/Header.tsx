"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Pixorly
        </Link>

        <nav className="flex items-center gap-6">
          <SignedIn>
            <Link
              href="/generate"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Generate
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Gallery
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </button>
            </SignInButton>
            <Link
              href="/sign-up"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
