"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { login } from "../actions";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="glass rounded-3xl p-8 shadow-2xl shadow-[#8A2BE2]/10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] mb-4 animate-pulse-glow">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#3C0E66]">Welcome back</h1>
          <p className="text-[#561493]/70 mt-2">Sign in to build your next campaign</p>
        </div>

        {/* Success message */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3C0E66] mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#D4B2F4] bg-white/50 text-[#3C0E66] placeholder-[#BC85EE] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#3C0E66] mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#D4B2F4] bg-white/50 text-[#3C0E66] placeholder-[#BC85EE] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#8A2BE2]/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D4B2F4]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/70 text-[#561493]/70">New to AdVisor?</span>
          </div>
        </div>

        {/* Register link */}
        <Link
          href="/register"
          className="block w-full py-3 px-4 rounded-xl font-semibold text-center text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4] transition-all"
        >
          Create an account
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#561493]/60 mt-8">
        By signing in, you agree to our{" "}
        <a href="#" className="text-[#701AC0] hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-[#701AC0] hover:underline">
          Privacy Policy
        </a>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
