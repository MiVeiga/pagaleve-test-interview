import { Suspense } from "react";

import { AppHeader } from "@/shared/components/app-header";
import { AppProviders } from "@/shared/providers/app-providers";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { env } from "@/core/config/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description:
    "Mini loja virtual com Next.js App Router, GraphQL e TanStack Query.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-white antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <AppProviders>
          <Suspense
            fallback={<div className="h-16 border-b border-border bg-card" />}
          >
            <AppHeader />
          </Suspense>
          <div className="flex flex-1 flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
