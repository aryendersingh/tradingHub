import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import TickerTape from "@/components/layout/TickerTape";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "TradingHub — Bloomberg Terminal for Everyone",
  description:
    "Real-time market data, charts, fundamentals, options, news, and economic indicators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <Providers>
          <div className="flex flex-col h-screen">
            <Navbar />
            <TickerTape />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
