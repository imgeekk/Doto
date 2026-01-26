"use client";

import React from "react";

export default function PageLoader() {
  return (
    <div className="relative flex items-center justify-center w-44 h-44 text-white font-inter text-[1.2em] font-light rounded-full select-none">
      {["L", "o", "a", "d", "i", "n", "g"].map((letter, i) => (
        <span
          key={i}
          className={`inline-block opacity-40 z-[1] rounded-full animate-loader-letter`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
