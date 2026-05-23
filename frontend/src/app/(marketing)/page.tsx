"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Video, Target, Map, Award, BookOpen, ChevronRight, Star } from "lucide-react";

export default function MarketingPage() {
  const [stats, setStats] = useState({ engineers: 0, gap: 0 });

  useEffect(() => {
    // Simple count-up micro-animations
    const interval = setInterval(() => {
      setStats((prev) => {
        const engineersNext = prev.engineers < 1500000 ? prev.engineers + 75000 : 1500000;
        const gapNext = prev.gap < 53 ? prev.gap + 3 : 53;
        if (engineersNext === 1500000 && gapNext === 53) {
          clearInterval(interval);
        }
        return { engineers: engineersNext, gap: gapNext };
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col font-sans text-black">
      {/* Swiss Minimalist Header Bar */}
      <header className="bg-white border-b-2 border-black text-black py-4 px-6 md:px-12 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          {/* Brutalist Logo */}
          <div className="relative w-8 h-8 border-2 border-black bg-black rounded-none flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-2.5 h-2.5 bg-white rounded-none absolute -top-1 -right-1 border border-black" />
            <div className="w-4 h-4 bg-[#E4FF00] border border-black rounded-none" />
          </div>
          <span className="font-display font-black text-lg tracking-tight uppercase">
            SkillForge<span className="text-black bg-[#E4FF00] px-1 ml-1 border border-black">.Ai</span>
          </span>
        </div>
        
        <nav className="hidden md:flex gap-8 items-center font-black text-xs uppercase tracking-wider text-neutral-500">
          <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
          <a href="#challenge" className="hover:text-black transition-colors">The Challenge</a>
          <a href="#testimonials" className="hover:text-black transition-colors">Success Stories</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-black hover:underline text-xs font-black uppercase tracking-widest transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="bg-[#E4FF00] hover:bg-black hover:text-[#E4FF00] text-black border-2 border-black px-4 py-2.5 rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section - Stark Swiss Brutalist Grid Layout */}
      <section className="bg-white text-black pt-20 pb-28 px-6 md:px-12 relative overflow-hidden border-b-2 border-black">
        {/* Minimalist Neobrutalist Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000007_1px,transparent_1px),linear-gradient(to_bottom,#00000007_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-neutral-100 border-2 border-black px-3.5 py-1.5 rounded-none text-[10px] font-black uppercase text-black tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NextGen Personalized AI Learning Engine</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-none uppercase">
              Transforming <span className="bg-[#E4FF00] border-2 border-black px-2 py-0.5 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Content</span> into Competence
            </h1>
            
            <p className="text-xs text-neutral-600 max-w-xl font-bold uppercase tracking-wider leading-relaxed">
              India faces a <span className="underline decoration-2 decoration-black font-black">53% talent gap in AI</span>. SkillForge.Ai discovers the best web content, builds a structured day-by-day roadmap, and verifies your skills so you get hired.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup" className="bg-black text-white hover:bg-[#E4FF00] hover:text-black border-2 border-black px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 group">
                Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="bg-white text-black hover:bg-neutral-50 border-2 border-black px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
                <Video className="w-4 h-4" /> Watch Demo
              </a>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-black max-w-lg">
              <div>
                <p className="text-4xl font-black text-black">
                  {(stats.engineers / 1000000).toFixed(1)}M+
                </p>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-black">Engineers Graduating Yearly</p>
              </div>
              <div>
                <p className="text-4xl font-black text-black">{stats.gap}%</p>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-black">AI & Cloud Skills Deficit</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center relative">
            {/* Mascot Brutalist Card */}
            <div className="w-full bg-white border-2 border-black rounded-none p-8 text-center relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:scale-[1.01] transition-transform">
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#00FF88] border border-black rounded-full animate-ping" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#00FF88] border border-black rounded-full" />
              
              {/* Mascot representation */}
              <div className="w-24 h-24 bg-neutral-50 border-2 border-black rounded-none flex items-center justify-center mx-auto mb-6 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-5xl select-none">🤖</span>
                <div className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] font-black tracking-widest px-2.5 py-1 border border-black rounded-none uppercase">BOT</div>
              </div>
              
              <h3 className="font-display font-black text-base uppercase tracking-wider text-black mb-2">I am SkillForge Bot</h3>
              <p className="text-xs text-neutral-600 font-semibold max-w-xs mb-6 uppercase tracking-wider leading-relaxed">
                "Tell me your goal (e.g. 'Build a React App' or 'Learn Machine Learning') and I'll extract videos, generate quizzes, and monitor your study room!"
              </p>
              
              <Link href="/signup" className="block w-full bg-black text-white hover:bg-[#E4FF00] hover:text-black border-2 border-black py-3.5 rounded-none text-xs font-black uppercase tracking-widest transition-all">
                Chat with SkillForge Bot →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-black text-black uppercase tracking-tight">How SkillForge Works</h2>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto uppercase font-black tracking-wider">Our AI system handles the educational heavy lifting so you can focus entirely on learning.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: "01", icon: Target, title: "Tell Us Your Goal", desc: "Input what skill or concept you want to learn, along with your weekly hour commitment." },
            { step: "02", icon: Map, title: "Get Your Roadmap", desc: "Our AI Orchestrator uses Gemini to generate a sequence of video lessons and study tasks." },
            { step: "03", icon: BookOpen, title: "Learn Daily", desc: "Watch high-quality curated videos, read generated notes, and check knowledge via MCQs." },
            { step: "04", icon: Award, title: "Track & Verify", desc: "Observe your velocity charts, complete practice code labs, and obtain verified certificates." },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between min-h-[250px]"
              >
                <span className="absolute top-6 right-6 text-4xl font-black text-neutral-100 group-hover:text-black/5 transition-colors select-none">{item.step}</span>
                <div className="w-12 h-12 bg-neutral-50 border-2 border-black rounded-none flex items-center justify-center text-black mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-black mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed uppercase tracking-wider">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="challenge" className="bg-[#F4F6FA] text-black py-24 px-6 md:px-12 border-t-2 border-b-2 border-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">The Indian Employability Gap</h2>
            
            <div className="space-y-4">
              {[
                { stat: "1.5M", title: "Engineers Graduate Annually", desc: "Yet university syllabi are years out of date, failing to cover modern frameworks." },
                { stat: "53%", title: "AI Talent Shortage", desc: "There are ten vacant Generative AI roles for every qualified candidate." },
                { stat: "<50%", title: "Employability Rate", desc: "Less than half of tech graduates possess core technical competence required by startups." }
              ].map((item, index) => (
                <div key={index} className="flex gap-4 items-center bg-white p-6 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xl font-black text-black bg-[#E4FF00] border-2 border-black px-4 py-2 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 select-none">
                    {item.stat}
                  </span>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-black">{item.title}</h4>
                    <p className="text-[10px] text-neutral-500 font-semibold uppercase mt-0.5 tracking-wider">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 space-y-6 bg-white text-black p-8 md:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#E4FF00] border-b border-black" />
            
            <h3 className="text-xl font-display font-black uppercase tracking-wider text-black">Our Solution: The 3 Pillars</h3>
            <p className="text-xs text-neutral-500 font-black uppercase tracking-widest leading-relaxed">
              SkillForge replaces traditional static paths with a responsive dynamic architecture:
            </p>
            
            <ul className="space-y-6 pt-2">
              {[
                { pillar: "Pillar 1: Discover", desc: "We extract the finest video tutorials on the web based on topics generated dynamically." },
                { pillar: "Pillar 2: Personalize", desc: "Schedules are tailored strictly to your skill levels and weekly learning bandwidth." },
                { pillar: "Pillar 3: Verify", desc: "Mock interviews evaluate concepts, practice labs review code, and certificates check authority." }
              ].map((item, index) => (
                <li key={index} className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-neutral-100 border border-black rounded-none flex items-center justify-center text-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs uppercase tracking-widest text-black block">{item.pillar}</span>
                    <p className="text-xs text-neutral-600 font-semibold uppercase mt-0.5 tracking-wider leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Loved by Learners Section */}
      <section id="testimonials" className="py-24 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-black text-black uppercase tracking-tight">Loved by Learners</h2>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto uppercase font-black tracking-wider">See how students are skipping standard courses and building direct skills.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { initials: "NK", name: "Noah Kim", handle: "@noah_k", quote: "The AI-generated course recommendations are stunning! I learned NumPy and Scikit-learn in three weeks instead of doing an entire college semester." },
            { initials: "RK", name: "Rajesh Kumar", handle: "@rajesh_dev", quote: "I love the interactive Practice Labs and the AI Study Room! Having the focus monitor keep me away from my phone has boosted my study discipline." },
            { initials: "SC", name: "Shreya Choudhury", handle: "@shreya_codes", quote: "The Mock Interview evaluations are spot on. It gives exact points on how to structure coding answers, which helped me land my frontend developer internship." }
          ].map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-black" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-neutral-700 leading-relaxed italic uppercase tracking-wider">
                  "{item.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                <div className="w-10 h-10 rounded-none border-2 border-black bg-neutral-100 flex items-center justify-center font-black text-xs text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {item.initials}
                </div>
                <div>
                  <h5 className="font-black text-xs uppercase tracking-wider text-black">{item.name}</h5>
                  <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{item.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-[#E4FF00] text-black py-20 px-6 md:px-12 text-center border-t-2 border-b-2 border-black">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl font-display font-black uppercase tracking-wide text-black leading-tight">Ready to Bridge the Competence Gap?</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-black/70">Create your first AI learning roadmap now. No credit card required.</p>
          <Link href="/signup" className="inline-flex bg-black text-white hover:bg-neutral-800 px-8 py-4 border-2 border-black rounded-none font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            Create My Roadmap →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-16 px-6 md:px-12 relative border-b-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-6 h-6 border-2 border-black bg-black rounded-none flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white border border-black rounded-none absolute -top-0.5 -right-0.5" />
                <div className="w-3 h-3 bg-[#E4FF00] border border-black rounded-none" />
              </div>
              <span className="font-display font-black uppercase text-base text-black">SkillForge.Ai</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider max-w-xs mt-1">We turn the unqualified millions into the qualified few.</p>
          </div>

          <div className="flex gap-8 text-xs font-black uppercase tracking-widest">
            <Link href="/login" className="hover:underline transition-colors text-black">Login</Link>
            <Link href="/signup" className="hover:underline transition-colors text-black">Sign Up</Link>
            <a href="#how-it-works" className="hover:underline transition-colors text-black">Features</a>
          </div>

          <div className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
            &copy; 2026 SkillForge.Ai.
          </div>
        </div>
      </footer>
    </div>
  );
}
