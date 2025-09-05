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
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";
import { GlobalErrorHandler } from "@/components/global-error-handler";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MedCheck+",
  description:
    "Medische praktijk management portaal voor patiënten, artsen en assistentes om afspraken en medische gegevens te beheren.",
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
                <AuthErrorBoundary>
                  <AuthProvider>
                    <SettingsProvider>
                      <GlobalErrorHandler />
                      {children}
                    </SettingsProvider>
                  </AuthProvider>
                </AuthErrorBoundary>
              </ToastProvider>
            </ThemeProvider>
          </ChunkLoadingBootstrapLite>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
