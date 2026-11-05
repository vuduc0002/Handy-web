import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ToastContainer from "@/app/components/ToastContainer";

const googleSans = localFont({
  src: [
    {
      path: "../public/fonts/GoogleSans-VariableFont_GRAD_opsz_wght.woff2",
      style: "normal",
    },
    {
      path: "../public/fonts/GoogleSans-Italic-VariableFont_GRAD_opsz_wght.woff2",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "HANDY - Thế giới to trong bàn tay nhỏ",
  description: "Giải pháp hỗ trợ học Ngôn ngữ ký hiệu ứng dụng công nghệ dành cho trẻ em và phụ huynh",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" }
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
      className={`${googleSans.variable} font-sans h-full`}
      style={{ colorScheme: "light" }}
    >
      <body
        className={`${googleSans.className} font-sans min-h-full flex flex-col bg-white text-[#1E1E1E]`}
      >
        <Header />
        <main className="flex-1 bg-white">
          {children}
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
