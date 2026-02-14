"use client";

import { useState } from "react";

interface TooltipProps {
  term: string;
  explanation: string;
}

export default function Tooltip({ term, explanation }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
        aria-label="용어 설명"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg left-0">
          <p className="font-semibold mb-1">{term}</p>
          <p className="text-gray-200">{explanation}</p>
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
