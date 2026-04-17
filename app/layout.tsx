import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ASHA CABLE COMMUNICATION & ANITHA SRIDHAR FIBERNET",
  description:
    "Business management dashboard for ASHA CABLE COMMUNICATION & ANITHA SRIDHAR FIBERNET — manage cable TV and internet customers, subscriptions, and monthly payments.",
  keywords: "cable management, internet subscription, payment tracking, ASHA cable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
