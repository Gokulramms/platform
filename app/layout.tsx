import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ASHA CABLE COMMUNICATION & ANITHA FIBERNET",
  description:
    "Business management dashboard for ASHA CABLE COMMUNICATION & ANITHA FIBERNET — manage cable TV and internet customers, subscriptions, and monthly payments.",
  keywords: "cable management, internet subscription, payment tracking, ASHA cable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-dark-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
