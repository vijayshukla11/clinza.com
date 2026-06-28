/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { signInWithEmail } from "../supabase";

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  setRoute: (route: string) => void;
}

export default function LoginPage({ onLoginSuccess, setRoute }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all requested fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const user = await signInWithEmail(email.trim(), password);
      if (user) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(user);
          // Redirect to appropriate console
          if (email.trim() === "sastaelectronic6@gmail.com") {
            setRoute("admin");
          } else {
            setRoute("account");
          }
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email format or password combination.");
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutDev = () => {
    setEmail("sastaelectronic6@gmail.com");
    setPassword("clinza2026");
  };

  return (
    <div id="login-page-container" className="bg-zinc-50 min-h-[85vh] py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans text-left">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-8 shadow-md space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono">
            Sartorial Digital Identity
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">
            Sign In to CLINZA
          </h2>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Access your wardrobe ledger, order status tracking history, and personalized style suggestions.
          </p>
        </div>

        {/* FEEDBACK STATUS */}
        {error && (
          <div className="bg-red-50 text-red-650 text-xs p-3.5 rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-150 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Credentials accepted. Authenticating session...
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input 
                id="login-email-input"
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input 
                id="login-password-input"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                required
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 hover:bg-[#F27D26] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors font-sans cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating Master Key..." : "Establish Secure Session"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* ADMIN CREDENTIAL SPEED ENTRY BYPASS */}
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <button 
            type="button" 
            onClick={handleShortcutDev}
            className="w-full bg-orange-600/5 hover:bg-orange-600/10 border border-dashed border-[#F27D26]/35 text-[#F27D26] text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Autofill Administrator Key (BYPASS)
          </button>
          
          <div className="text-center text-gray-450 text-[11px]">
            New to CLINZA?{" "}
            <button 
              type="button" 
              onClick={() => setRoute("register")}
              className="text-[#F27D26] font-bold hover:underline"
            >
              Register here
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
