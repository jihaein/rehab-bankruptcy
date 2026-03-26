"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/about", label: "사무소 소개" },
    { href: "/diagnosis", label: "무료 진단" },
    { href: "/documents", label: "서류 제출" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;

  return (
    <nav className="bg-[#1a1f2e] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-white tracking-tight">지산 법무사사무소</span>
            <span className="hidden sm:block text-[11px] text-slate-500 border-l border-slate-600 pl-2 ml-0.5">개인회생·파산 전문</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-[14px] font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="tel:0313887771"
              className="ml-3 px-4 py-2 text-[14px] font-semibold rounded-md bg-[#4f6ef7] hover:bg-[#4060e6] text-white transition-colors"
            >
              상담 전화
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center text-slate-400"
            aria-label="메뉴"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#1a1f2e] border-t border-white/5">
          <div className="px-5 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-[15px] font-medium rounded-md ${
                  isActive(item.href) ? "bg-white/10 text-white" : "text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="tel:0313887771"
              className="block text-center mt-2 px-4 py-2.5 text-[15px] font-semibold rounded-md bg-[#4f6ef7] text-white"
            >
              031-388-7771 상담 전화
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
