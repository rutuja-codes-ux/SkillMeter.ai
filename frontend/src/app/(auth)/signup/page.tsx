"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Sparkles, ArrowRight, User, Lock, Mail, AlertCircle, Shield } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      if (data && data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        if (data.user) {
          localStorage.setItem("user_profile", JSON.stringify(data.user));
        }
        router.push("/roadmap");
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-between font-sans text-black">
      {/* Top Navbar - Swiss Minimalist Header Bar */}
      <header className="bg-white border-b-2 border-black py-4 px-6 md:px-12 flex justify-between items-center relative z-10">
        <Link href="/" className="flex items-center gap-3">
          {/* Brutalist Logo */}
          <div className="relative w-8 h-8 border-2 border-black bg-black rounded-none flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-2.5 h-2.5 bg-white rounded-none absolute -top-1 -right-1 border border-black" />
            <div className="w-4 h-4 bg-[#E4FF00] border border-black rounded-none" />
          </div>
          <span className="font-display font-black text-lg tracking-tight uppercase text-black">
            SkillForge<span className="text-black bg-[#E4FF00] px-1 ml-1 border border-black">.Ai</span>
          </span>
        </Link>
        <Link href="/login" className="text-black hover:underline text-xs font-black uppercase tracking-widest transition-colors">
          Sign In Instead
        </Link>
      </header>

      {/* Main Content Split Page */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        {/* Brutalist card container */}
        <div className="bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full grid md:grid-cols-12 relative overflow-hidden">
          
          {/* Side Banner Pane (left side for signup) */}
          <div className="hidden md:flex md:col-span-5 bg-[#F4F6FA] p-8 text-black flex-col justify-between border-r-2 border-black relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000007_1px,transparent_1px),linear-gradient(to_bottom,#00000007_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1.5 rounded-none text-[10px] font-black uppercase text-black tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-fit relative z-10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Deficit Solution</span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Brutalist card mascot box */}
              <div className="w-16 h-16 bg-white border-2 border-black rounded-none flex items-center justify-center relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl select-none">🎓</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-black">Bridge the 53% Gap</h3>
              <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider leading-relaxed">
                "SkillForge.Ai translates goals into day-by-day learning logs, video recommendations, mock code execution environments, and validated certificates. Join the competent few!"
              </p>
            </div>

            <div className="flex gap-2 items-center text-[9px] text-neutral-400 font-black uppercase tracking-widest relative z-10">
              <Shield className="w-3.5 h-3.5 text-black shrink-0" /> Secure JWT Session
            </div>
          </div>

          {/* Form Pane */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-display font-black uppercase tracking-tight text-black">Create Your Account</h2>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Get started free on SkillForge.Ai</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-black p-4 rounded-none flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs text-red-600 font-black tracking-wider leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-none border-2 border-black focus:outline-none focus:bg-neutral-50 text-xs font-bold tracking-wider"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-none border-2 border-black focus:outline-none focus:bg-neutral-50 text-xs font-bold tracking-wider"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-none border-2 border-black focus:outline-none focus:bg-neutral-50 text-xs font-bold tracking-wider"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-none border-2 border-black focus:outline-none focus:bg-neutral-50 text-xs font-bold tracking-wider"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-none border-2 border-black focus:outline-none focus:bg-neutral-50 text-xs font-bold tracking-wider"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white hover:bg-[#E4FF00] hover:text-black border-2 border-black py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "Creating Account..." : "Create Account"} 
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="text-center mt-6 text-xs font-bold uppercase tracking-wider text-neutral-500">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-black hover:underline">
                Sign in
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white text-black py-8 px-6 md:px-12 border-t-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
          <div>&copy; 2026 SkillForge.Ai.</div>
          <div className="flex gap-6 text-xs text-black">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/login" className="hover:underline">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
