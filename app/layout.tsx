import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "지산 법무사사무소 | 개인회생·파산면책 전문",
  description: "18년 경력의 지산 법무사사무소에서 개인회생·파산면책 무료 진단 및 전문 상담을 받아보세요. 대표 법무사 인태관.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
