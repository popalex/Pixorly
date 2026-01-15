import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixorly - AI Image Generation Studio",
  description: "Platform-agnostic AI image generation with multiple models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
