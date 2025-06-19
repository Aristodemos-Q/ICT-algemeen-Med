/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

// Import polyfill for browser globals to prevent SSR errors - MUST BE FIRST
import "../lib/browser-polyfill.js";

import React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/contexts/settings-context";
import { ToastProvider } from "@/components/ui/toast";
import ChunkErrorBoundary from "@/components/chunk-error-boundary";
import ChunkLoadingBootstrapLite from "@/components/chunk-loading-bootstrap-lite";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BV Floriande - Trainers Platform",
  description:
    "Platform voor trainers van BV Floriande om oefeningen, aanwezigheid en groepsevaluaties bij te houden.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ChunkErrorBoundary>
          <ChunkLoadingBootstrapLite>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <ToastProvider>
                <AuthProvider>
                  <SettingsProvider>
                    {children}
                  </SettingsProvider>
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </ChunkLoadingBootstrapLite>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
