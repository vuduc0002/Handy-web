import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HANDY - Học Từ Vựng Vui",
  description: "Ứng dụng học từ vựng thú vị dành cho trẻ em",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      style={{ backgroundColor: "#fffbeb", colorScheme: "light" }}
    >
      <body
        className="min-h-full flex flex-col bg-amber-50 text-gray-800"
        style={{ backgroundColor: "#fffbeb", colorScheme: "light" }}
      >
        <Header />
        <main className="flex-1 bg-amber-50" style={{ backgroundColor: "#fffbeb" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
