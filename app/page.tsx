import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      {/* Background grid pattern */}
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
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-accent opacity-[0.05] blur-[100px]" />

      <Header />

      <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center px-6">
        {/* Badge */}
        <div className="mb-8 animate-fade-in opacity-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-4 py-2 text-body-sm text-text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Multi-Model AI Image Generation
          </span>
        </div>

        {/* Main heading */}
        <h1 className="animation-delay-100 mb-6 animate-fade-in-up text-center font-display text-display-xl tracking-tight opacity-0 md:text-[6rem] lg:text-[7rem]">
          Create with
          <br />
          <span className="relative">
            <span className="text-gradient">Imagination</span>
            <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
          </span>
        </h1>

        {/* Subheading */}
        <p className="animation-delay-200 mb-12 max-w-xl animate-fade-in-up text-center text-body-xl text-text-secondary opacity-0">
          Studio-grade AI image generation. Multiple models. One unified platform. Craft visuals
          that stand apart.
        </p>

        {/* CTAs */}
        <div className="animation-delay-300 flex animate-fade-in-up flex-col items-center gap-4 opacity-0 sm:flex-row sm:gap-6">
          <SignedIn>
            <Link
              href="/generate"
              className="bg-accent-gradient group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4 font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_var(--accent-glow)]"
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
            </Link>
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-up"
              className="bg-accent-gradient group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4 font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_var(--accent-glow)]"
            >
              <span>Get Started Free</span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 font-semibold text-text-primary transition-all duration-300 hover:border-accent hover:text-accent"
            >
              Sign In
            </Link>
          </SignedOut>
        </div>

        {/* Feature highlights */}
        <div className="animation-delay-400 mt-24 grid animate-fade-in-up gap-6 opacity-0 sm:grid-cols-3">
          {[
            { label: "Models", value: "8+", desc: "AI Engines" },
            { label: "Generation", value: "<10s", desc: "Avg. Time" },
            { label: "Quality", value: "4K", desc: "Resolution" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-gradient group relative overflow-hidden rounded-2xl bg-bg-secondary p-6 text-center transition-all duration-300 hover:bg-bg-tertiary"
            >
              <p className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-display-sm text-text-primary">{stat.value}</p>
              <p className="text-body-sm text-text-secondary">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="animation-delay-500 absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-fade-in flex-col items-center gap-2 opacity-0">
          <span className="text-body-xs text-text-tertiary">Scroll to explore</span>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-border-strong p-1">
            <div className="h-2 w-1 animate-bounce rounded-full bg-accent" />
          </div>
        </div>
      </main>

      {/* Second section - Gallery preview */}
      <section className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="mb-16 text-center">
          <h2 className="font-display text-display-md text-text-primary">
            Your vision. <span className="text-gradient">Amplified.</span>
          </h2>
          <p className="mt-4 text-body-lg text-text-secondary">
            From concept to creation in seconds
          </p>
        </div>

        {/* Bento grid showcase */}
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Large featured card */}
          <div className="border-gradient group relative overflow-hidden rounded-2xl bg-bg-secondary md:col-span-2 md:row-span-2">
            <div className="aspect-[4/3] w-full md:aspect-auto md:h-full">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-bg-tertiary to-bg-elevated p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
                    <svg
                      className="h-8 w-8 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-display-sm text-text-primary">FLUX Pro</h3>
                  <p className="mt-2 text-text-secondary">State-of-the-art image generation</p>
                </div>
              </div>
            </div>
            <div className="from-bg-primary/80 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* Small cards */}
          <div className="border-gradient group relative overflow-hidden rounded-2xl bg-bg-secondary p-6 transition-all duration-300 hover:bg-bg-tertiary">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted">
              <svg
                className="h-6 w-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary">Lightning Fast</h3>
            <p className="mt-1 text-body-sm text-text-secondary">
              Optimized pipelines for rapid generation
            </p>
          </div>

          <div className="border-gradient group relative overflow-hidden rounded-2xl bg-bg-secondary p-6 transition-all duration-300 hover:bg-bg-tertiary">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted">
              <svg
                className="h-6 w-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary">Fine Control</h3>
            <p className="mt-1 text-body-sm text-text-secondary">
              Advanced parameters for precise results
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="border-gradient relative overflow-hidden rounded-3xl bg-bg-secondary p-12 text-center md:p-20">
          {/* Background accent glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-10 blur-[100px]" />

          <h2 className="relative font-display text-display-md text-text-primary md:text-display-lg">
            Ready to create?
          </h2>
          <p className="relative mt-4 text-body-lg text-text-secondary">
            Join thousands of creators using Pixorly
          </p>

          <div className="relative mt-10">
            <SignedIn>
              <Link
                href="/generate"
                className="bg-accent-gradient group inline-flex items-center gap-3 rounded-xl px-10 py-5 text-lg font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_var(--accent-glow)]"
              >
                <span>Open Studio</span>
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-up"
                className="bg-accent-gradient group inline-flex items-center gap-3 rounded-xl px-10 py-5 text-lg font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_var(--accent-glow)]"
              >
                <span>Start Free Trial</span>
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </SignedOut>
          </div>
        </div>
      </section>

      {/* Simple footer */}
      <footer className="border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-display text-xl text-text-primary">Pixorly</p>
            <p className="text-body-sm text-text-tertiary">
              © {new Date().getFullYear()} Pixorly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
