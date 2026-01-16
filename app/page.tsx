import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-white">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold">Pixorly</h1>
          <p className="mb-8 text-xl">AI Image Generation Studio - Multi-Model Support</p>
          <div className="flex justify-center gap-4">
            <SignedIn>
              <Link
                href="/generate"
                className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition hover:shadow-xl"
              >
                Start Generating
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-up"
                className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition hover:shadow-xl"
              >
                Get Started
              </Link>
            </SignedOut>
          </div>
        </div>
      </main>
    </div>
  );
}
