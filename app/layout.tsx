import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixorly - AI Image Generation Studio",
  description:
    "Studio-grade AI image generation with multiple models. Create stunning visuals with FLUX, Seedream, and more.",
  keywords: ["AI", "image generation", "FLUX", "Seedream", "art", "creative"],
  openGraph: {
    title: "Pixorly - AI Image Generation Studio",
    description: "Studio-grade AI image generation with multiple models",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#F59E0B",
          colorBackground: "#141417",
          colorInputBackground: "#1C1C21",
          colorInputText: "#FAFAF9",
          colorText: "#FAFAF9",
          colorTextSecondary: "#A1A1A6",
          borderRadius: "0.75rem",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        },
        elements: {
          card: "bg-bg-secondary border border-border shadow-lg",
          headerTitle: "font-display text-text-primary",
          headerSubtitle: "text-text-secondary",
          formFieldLabel: "text-text-secondary",
          formFieldInput:
            "bg-bg-tertiary border-border text-text-primary placeholder:text-text-muted",
          formButtonPrimary:
            "bg-accent hover:bg-accent-hover text-bg-primary font-semibold transition-all duration-300",
          footerActionLink: "text-accent hover:text-accent-hover",
          identityPreviewEditButton: "text-accent hover:text-accent-hover",
          userButtonPopoverCard: "bg-bg-secondary border border-border",
          userButtonPopoverActionButton: "hover:bg-bg-tertiary text-text-primary",
          userButtonPopoverActionButtonText: "text-text-primary",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="font-body antialiased">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
