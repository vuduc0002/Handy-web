import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HANDY - Học Từ Vựng Vui",
  description: "Ứng dụng học từ vựng thú vị dành cho trẻ em",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/handy-logo.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/handy-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} font-sans h-full`}
      style={{ backgroundColor: "#fffbeb", colorScheme: "light" }}
    >
      <body
        className="font-sans min-h-full flex flex-col bg-amber-50 text-gray-800"
        style={{ backgroundColor: "#fffbeb", colorScheme: "light" }}
      >
        <Header />
        <main className="flex-1 bg-amber-50 font-be-vietnam" style={{ backgroundColor: "#fffbeb" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
