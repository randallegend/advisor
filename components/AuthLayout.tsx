"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#F8F2FE] via-white to-[#F0E5FC]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D4B2F4] to-[#BC85EE] rounded-full opacity-30 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#A358E8] to-[#8A2BE2] rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#701AC0]/10 to-[#561493]/10 rounded-full blur-3xl" />

        {/* Neural network dots */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-[#8A2BE2] neural-dot" />
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-[#A358E8] neural-dot" style={{ animationDelay: "-0.5s" }} />
        <div className="absolute bottom-32 left-40 w-2 h-2 rounded-full bg-[#701AC0] neural-dot" style={{ animationDelay: "-1s" }} />
        <div className="absolute bottom-20 right-20 w-2 h-2 rounded-full bg-[#BC85EE] neural-dot" style={{ animationDelay: "-1.5s" }} />
        <div className="absolute top-1/3 left-16 w-1.5 h-1.5 rounded-full bg-[#561493] neural-dot" style={{ animationDelay: "-0.7s" }} />
        <div className="absolute bottom-1/3 right-24 w-2.5 h-2.5 rounded-full bg-[#D4B2F4] neural-dot" style={{ animationDelay: "-1.2s" }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#8A2BE2 1px, transparent 1px), linear-gradient(90deg, #8A2BE2 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
