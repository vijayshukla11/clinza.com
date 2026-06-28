/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../supabase";
import { CustomersService } from "../services/supabaseService";

interface RegisterPageProps {
  onRegisterSuccess: (user: any) => void;
  setRoute: (route: string) => void;
}

export default function RegisterPage({ onRegisterSuccess, setRoute }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all requested fields (Name, Email, Password).");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Sign up user via Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            displayName: name.trim()
          }
        }
      });

      if (signUpError) throw signUpError;
      
      const sessionUser = data.user;
      if (sessionUser) {
        // 2. Provision customer ledger in customers database
        await CustomersService.create({
          id: sessionUser.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          addressBook: [],
          totalSpend: 0,
          wishlist: []
        });

        setSuccess(true);
        setTimeout(() => {
          onRegisterSuccess({
            email: sessionUser.email,
            displayName: name.trim(),
            id: sessionUser.id
          });
          setRoute("account");
        }, 1200);
      } else {
        throw new Error("Activation sequence timed out. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Verify your connection details and parameters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-page-container" className="bg-zinc-50 min-h-[85vh] py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans text-left animate-fade-in">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-8 shadow-md space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono">
            Register Wardrobe Ledger
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">
            Create CLINZA Account
          </h2>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Register to save customized preferences, bookmark wishlisted garments, and manage orders instantly.
          </p>
        </div>

        {/* FEEDBACK */}
        {error && (
          <div className="bg-red-50 text-red-650 text-xs p-3.5 rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-150 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Account provisioned successfully! Redirecting ledger...
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input 
                id="reg-name-input"
                type="text" 
                placeholder="Sam Sterling"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input 
                id="reg-email-input"
                type="email" 
                placeholder="sam@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input 
                id="reg-phone-input"
                type="tel" 
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <input 
                id="reg-password-input"
                type="password" 
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            id="reg-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 hover:bg-[#F27D26] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors font-sans cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? "Provisioning Ledger Account..." : "Confirm Wardrobe Alliance"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-gray-450 border-t border-gray-100 pt-5 text-[11px]">
          Already have an account?{" "}
          <button 
            type="button" 
            onClick={() => setRoute("login")}
            className="text-[#F27D26] font-bold hover:underline"
          >
            Log In here
          </button>
        </div>

      </div>
    </div>
  );
}
