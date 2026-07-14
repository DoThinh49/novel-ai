import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovelAI Studio — Nền tảng Sáng tác Tiểu thuyết bằng AI",
  description:
    "Nền tảng hỗ trợ sáng tác tiểu thuyết và Light Novel bằng trí tuệ nhân tạo. Tạo cốt truyện, nhân vật, và viết tự động với Google Gemini AI.",
  keywords: [
    "AI writing",
    "novel writing",
    "light novel",
    "tiểu thuyết",
    "sáng tác",
    "Gemini AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
