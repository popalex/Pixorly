"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-bg-primary/80 sticky top-0 z-50 border-b border-border-subtle backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-2xl tracking-tight text-text-primary transition-colors duration-300 group-hover:text-accent">
            Pixorly
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <SignedIn>
            <NavLink href="/generate" active={isActive("/generate")}>
              Generate
            </NavLink>
            <NavLink href="/gallery" active={isActive("/gallery")}>
              Gallery
            </NavLink>
            <NavLink href="/account" active={isActive("/account")}>
              Account
            </NavLink>

            <div className="ml-4 border-l border-border-subtle pl-4">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 ring-2 ring-border-subtle hover:ring-accent transition-all duration-300",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg px-4 py-2 text-body-sm font-medium text-text-secondary transition-all duration-300 hover:bg-bg-tertiary hover:text-text-primary">
                Sign In
              </button>
            </SignInButton>
            <Link
              href="/sign-up"
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-body-sm font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:shadow-glow"
            >
              Get Started
            </Link>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-lg px-4 py-2 text-body-sm font-medium transition-all duration-300 ${
        active ? "text-accent" : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-accent" />
      )}
    </Link>
  );
}
