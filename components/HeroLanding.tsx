"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

// MacBook-style browser window mockup component
function BrowserMockup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#8A2BE2]/20 border border-[#D4B2F4]/50 bg-white">
      {/* Window chrome */}
      <div className="bg-gradient-to-b from-[#F8F2FE] to-[#F0E5FC] px-4 py-3 flex items-center gap-3 border-b border-[#D4B2F4]/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-lg bg-white/80 border border-[#D4B2F4]/50 text-xs text-[#561493]/70 font-medium">
            {title}
          </div>
        </div>
        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>
      {/* Content */}
      <div className="bg-gradient-to-br from-[#F8F2FE] via-white to-[#F0E5FC]">
        {children}
      </div>
    </div>
  );
}

const strategists = [
  {
    id: "ian",
    name: "Ian",
    title: "Performance Strategist",
    description: "Data-obsessed, conversion-focused. Optimizes every dollar for ROI.",
    lightBg: "bg-[#ECFEFF]",
    textColor: "text-[#0891B2]",
    avatar: "/assets/images/ian_avatar.png",
  },
  {
    id: "mart",
    name: "Mart",
    title: "Brand Growth Strategist",
    description: "Creative storyteller. Builds awareness and emotional connections.",
    lightBg: "bg-[#F0E5FC]",
    textColor: "text-[#701AC0]",
    avatar: "/assets/images/mart_avatar.png",
  },
  {
    id: "randall",
    name: "Randall",
    title: "Data-Driven Strategist",
    description: "Analytics wizard. Finds insights in numbers and trends.",
    lightBg: "bg-[#ECFDF5]",
    textColor: "text-[#10B981]",
    avatar: "/assets/images/randall_avatar.png",
  },
];

export default function HeroLanding() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F2FE] via-white to-[#F0E5FC] relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D4B2F4] to-[#BC85EE] rounded-full opacity-30 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#A358E8] to-[#8A2BE2] rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#701AC0]/10 to-[#561493]/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-[#8A2BE2] neural-dot" />
        <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-[#A358E8] neural-dot" style={{ animationDelay: "-0.5s" }} />
        <div className="absolute bottom-32 left-40 w-2 h-2 rounded-full bg-[#701AC0] neural-dot" style={{ animationDelay: "-1s" }} />
        <div className="absolute bottom-20 right-20 w-2 h-2 rounded-full bg-[#BC85EE] neural-dot" style={{ animationDelay: "-1.5s" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#8A2BE2 1px, transparent 1px), linear-gradient(90deg, #8A2BE2 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-[100]">
        <nav className={`flex items-center justify-between px-6 py-4 lg:px-12 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-[#D4B2F4]/30 shadow-sm shadow-[#8A2BE2]/5"
            : "bg-transparent border-b border-transparent"
        }`}>
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/advisor_logo.png"
            alt="AdVisor"
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#701AC0] hover:bg-[#F0E5FC]/80 transition-all"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-lg shadow-[#8A2BE2]/25 hover:shadow-xl hover:shadow-[#8A2BE2]/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </nav>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[#D4B2F4] backdrop-blur-sm mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#8A2BE2] animate-pulse" />
          <span className="text-sm text-[#561493] font-medium">AI-Powered Media Strategy</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#3C0E66] leading-tight mb-6 animate-slide-up">
          Transform Ideas Into{" "}
          <span className="bg-gradient-to-r from-[#701AC0] via-[#8A2BE2] to-[#A358E8] bg-clip-text text-transparent animate-gradient">
            Winning Campaigns
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#561493]/80 max-w-3xl mx-auto mb-12 animate-slide-up">
          Describe your campaign goal and let AI strategists handle the rest — audience targeting, trend analysis, budget allocation, and ad creative in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-scale-in">
          <Link
            href="/register"
            className="px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-xl shadow-[#8A2BE2]/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl text-lg font-semibold text-[#701AC0] bg-white/80 border border-[#D4B2F4] hover:bg-[#F0E5FC] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>

        {/* Strategist previews */}
        <div className="mt-24 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-[#3C0E66] mb-3">Meet Our AI Strategists</h2>
          <p className="text-[#561493]/70 mb-8">Each strategist brings unique expertise to craft your perfect campaign</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {strategists.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-white shadow-lg">
                <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-[#3C0E66] mb-1">{s.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${s.lightBg} ${s.textColor}`}>
                {s.title}
              </span>
              <p className="text-sm text-[#561493]/70">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Feature Showcase - Campaign Builder */}
        <div className="mt-32 w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0E5FC] border border-[#D4B2F4] mb-4">
                <Zap className="w-4 h-4 text-[#701AC0]" />
                <span className="text-sm font-semibold text-[#701AC0]">Campaign Blueprint</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3C0E66] mb-4">
                AI-Powered Strategy Generation
              </h2>
              <p className="text-lg text-[#561493]/70 mb-6">
                Get a complete campaign blueprint in seconds. Our AI analyzes market signals, allocates budget across the funnel, and generates targeted audience segments — all from a simple description.
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time market signals powered by Google Trends data",
                  "Smart budget allocation across awareness, consideration & conversion",
                  "AI-generated audience segments with behavioral targeting",
                  "Interactive funnel visualization with drag-to-adjust",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#561493]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <BrowserMockup title="advisor.ai/campaign/blueprint">
                <img
                  src="/assets/images/blueprint_sample.png"
                  alt="Campaign Blueprint"
                  className="w-full h-auto"
                />
              </BrowserMockup>
              {/* Floating PDF Export mockup */}
              <div className="absolute -bottom-8 -right-8 w-40 lg:w-48 rounded-xl overflow-hidden shadow-2xl shadow-[#8A2BE2]/30 border border-[#D4B2F4]/50 bg-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] px-3 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-white">PDF Export</span>
                </div>
                <img
                  src="/assets/images/pdf_sample.png"
                  alt="PDF Export"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase - Trends Explorer */}
        <div className="mt-32 w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-1 relative">
              <BrowserMockup title="advisor.ai/trends">
                <img
                  src="/assets/images/trends_sample.png"
                  alt="Trends Explorer"
                  className="w-full h-auto"
                />
              </BrowserMockup>
              {/* Floating Chart Interaction mockup */}
              <div className="absolute -bottom-8 -left-8 w-52 lg:w-64 rounded-xl overflow-hidden shadow-2xl shadow-[#06B6D4]/30 border border-[#A5F3FC]/50 bg-white transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] px-3 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span className="text-xs font-semibold text-white">Create Directly</span>
                </div>
                <img
                  src="/assets/images/chartinteract_sample.png"
                  alt="Click to Create Campaign"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="text-left order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFEFF] border border-[#A5F3FC] mb-4">
                <TrendingUp className="w-4 h-4 text-[#0891B2]" />
                <span className="text-sm font-semibold text-[#0891B2]">Trends Explorer</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3C0E66] mb-4">
                Spot Opportunities Before They Peak
              </h2>
              <p className="text-lg text-[#561493]/70 mb-6">
                Explore real-time search trends powered by Google Trends data. Identify rising keywords, discover breakout opportunities, and create campaigns directly from trending data points.
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time Google Trends integration",
                  "Interactive charts with click-to-create campaigns",
                  "Rising & breakout query detection",
                  "Geographic trend filtering",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#22D3EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#561493]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 w-full max-w-4xl">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#701AC0]/5 via-transparent to-[#8A2BE2]/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3C0E66] mb-4">
                Ready to Transform Your Campaigns?
              </h2>
              <p className="text-lg text-[#561493]/70 mb-8 max-w-2xl mx-auto">
                Join marketers who are using AI to create smarter, data-driven advertising strategies in minutes, not days.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-xl shadow-[#8A2BE2]/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" />
                Start Building for Free
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-[#D4B2F4]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/images/advisor_logo.png"
              alt="AdVisor"
              className="h-8 w-auto object-contain opacity-70"
            />
          </div>
          <p className="text-sm text-[#561493]/50">
            Built with AI for modern marketers
          </p>
        </div>
      </footer>
    </div>
  );
}
