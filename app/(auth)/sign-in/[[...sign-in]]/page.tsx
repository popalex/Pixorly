import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250, 250, 249, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250, 250, 249, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.08] blur-[120px]" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-body-sm text-text-secondary transition-colors duration-300 hover:text-text-primary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Pixorly
      </Link>

      {/* Clerk SignIn */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="font-display text-display-sm text-text-primary">Welcome back</h1>
          <p className="mt-2 text-text-secondary">Sign in to continue to your studio</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
