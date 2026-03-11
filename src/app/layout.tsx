import type { Metadata } from "next";
import { Geist, Geist_Mono, Trocchi } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const trocchi = Trocchi({
  variable: "--font-trocchi",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vibe Studio - AI Image Generation",
  description: "Create stunning images with AI from multiple providers in one unified interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${trocchi.variable} antialiased`}
      >
        <Sidebar />
        <main className="lg:ml-[280px] min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
