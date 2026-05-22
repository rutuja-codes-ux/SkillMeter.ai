"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Activity,
  Code,
  Users,
  Tv,
  Brain,
  Award,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Roadmap", href: "/roadmap", icon: Map },
  { name: "Practice Lab", href: "/practice-lab", icon: Code },
  { name: "AI Study Room", href: "/study-room", icon: Tv },
  { name: "Mock Interview", href: "/mock-interview", icon: Brain },
  { name: "Mentor Connect", href: "/mentor-connect", icon: Users },
  { name: "Progress Analytics", href: "/progress", icon: Activity },
  { name: "Certificates", href: "/certificates", icon: Award },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth check
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Try reading profile from localStorage
    const cachedProfile = localStorage.getItem("user_profile");
    if (cachedProfile) {
      try {
        setUserProfile(JSON.parse(cachedProfile));
      } catch (e) {
        console.error("Error parsing user profile", e);
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_profile");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-bold text-xs text-black tracking-wider uppercase">Loading...</p>
      </div>
    );
  }

  const username = userProfile?.username || "Learner";
  const userXP = userProfile?.profile?.xp_points ?? 120;
  const userLevel = Math.floor(userXP / 100) + 1;

  return (
    <div className="min-h-screen bg-white flex font-sans text-black">
      {/* Mobile Top Navbar */}
      <div className="md:hidden w-full bg-white text-black py-3 px-4 flex justify-between items-center fixed top-0 left-0 z-40 border-b border-black">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-base tracking-tighter">SkillMeter.Ai</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-black p-1 border border-black rounded-none bg-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[160px] bg-white text-black border-r border-black flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen rounded-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b border-black relative overflow-hidden">
            <div className="flex flex-col gap-1">
              <span className="font-display font-black text-sm tracking-tighter block leading-none">
                SkillMeter<span className="font-normal text-xs text-neutral-500">.Ai</span>
              </span>
              <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider block">Content → Competence</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-black hover:bg-neutral-100 p-1 border border-black rounded-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 bg-neutral-50 border-b border-black relative overflow-hidden">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-bold text-xs border border-black shrink-0 uppercase">
                {username.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs truncate text-black uppercase tracking-wide">{username}</h4>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5 rounded-none uppercase w-fit leading-none">LVL {userLevel}</span>
                  <span className="text-[10px] text-neutral-600 font-bold">{userXP} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-all rounded-none ${
                    isActive
                      ? "bg-black text-white"
                      : "text-neutral-700 hover:text-black hover:bg-neutral-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-neutral-500 group-hover:text-black"}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Action */}
        <div className="p-3 border-t border-black bg-neutral-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-700 hover:text-white hover:bg-black border border-black transition-all rounded-none bg-white"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:h-screen overflow-hidden pt-12 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-16 bg-white">
          {children}
        </main>
      </div>

      {/* Background Overlay for Mobile Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
    </div>
  );
}
