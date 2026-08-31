"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("demo.analyst@institution.in");
  const [password, setPassword] = useState("demo123");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("trace_user", email);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070C16] p-6">
      <div className="w-full max-w-md rounded-xl border border-[#1D293B] bg-[#0D1726] p-8 shadow-2xl shadow-indigo-950/20">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-[#c0c1ff]">
            <span className="material-symbols-outlined text-xl">security</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#d7e3fb]">TRACE</h1>
          <p className="mt-2 text-sm text-[#908fa0]">Email Forensic Investigation Console</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-[#908fa0]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#1D293B] bg-[#09111F] px-3 py-2.5 text-sm text-[#d7e3fb] outline-none ring-0 placeholder:text-[#464554] focus:border-indigo-500"
              placeholder="analyst@institution.in"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-[#908fa0]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[#1D293B] bg-[#09111F] px-3 py-2.5 text-sm text-[#d7e3fb] outline-none placeholder:text-[#464554] focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Login to Dashboard
          </button>
        </form>

        <div className="mt-5 rounded-md border border-[#1D293B] bg-[#09111F] p-3 text-xs text-[#908fa0]">
          Demo access: <span className="text-[#d7e3fb]">demo.analyst@institution.in</span> / <span className="text-[#d7e3fb]">demo123</span>
        </div>
      </div>
    </div>
  );
}
