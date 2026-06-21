import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFit AI — AI-Powered Resume Analyzer",
  description: "Score your resume against any job description using AI. Get keyword matching, missing skill detection, and targeted improvement suggestions to beat the ATS.",
  keywords: ["resume analyzer", "ATS score", "AI resume", "job fit", "career tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Analytics/>
      <body className="min-h-full flex flex-col relative">
        <Header />
        <div className="flex-1 w-full relative z-10">
          {children}
        </div>
        <Footer />
        </body>
    </html>
  );
}
