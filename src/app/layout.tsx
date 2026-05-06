import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/shared/DashboardLayout";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
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
  title: "Agrocart — Hub & Spoke Agro-Logistics",
  description: "Connecting Nigerian farmers, transporters, and grain buyers through optimized load pooling and real-time tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <OfflineIndicator />
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
