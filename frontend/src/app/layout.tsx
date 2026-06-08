import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinAI - AI Merchant Intelligence",
  description: "Advanced real-time merchant operations and fraud detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="ml-64 w-[calc(100vw-16rem)] p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
