"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = {
  ADMIN: [
    { href: "/hq", labelKey: "nav_hq", icon: "📡" },
    { href: "/hq/analytics", labelKey: "nav_analytics", icon: "📊" },
    { href: "/hq/fleet", labelKey: "nav_fleet", icon: "🗺️" },
    { href: "/hq/vault", labelKey: "nav_vault", icon: "🛡️" },
    { href: "/hq/hubs", labelKey: "nav_hubs", icon: "📍" },
    { href: "/hq/dispatch", labelKey: "nav_dispatch", icon: "🗺️" },
    { href: "/hq/users", labelKey: "nav_users", icon: "👥" },
    { href: "/hub", labelKey: "nav_hub_view", icon: "🏭" },
    { href: "/loadboard", labelKey: "nav_loadboard", icon: "🚛" },
    { href: "/farmer", labelKey: "nav_farmer_view", icon: "🌾" },
  ],
  HUB_MANAGER: [
    { href: "/hub", labelKey: "nav_my_hub", icon: "🏭" },
    { href: "/hub/inventory", labelKey: "nav_inventory", icon: "📦" },
  ],
  TRANSPORTER: [
    { href: "/loadboard", labelKey: "nav_loadboard", icon: "🚛" },
  ],
  FARMER: [
    { href: "/farmer", labelKey: "nav_my_dashboard", icon: "🌾" },
  ],
};

// Bottom tab items for mobile — show only the most important 3-4 per role
const mobileTabItems = {
  ADMIN: [
    { href: "/hq", labelKey: "nav_hq", icon: "📡" },
    { href: "/hq/dispatch", labelKey: "nav_dispatch", icon: "🗺️" },
    { href: "/hq/hubs", labelKey: "nav_hubs", icon: "📍" },
    { href: "/hq/users", labelKey: "nav_users", icon: "👥" },
  ],
  HUB_MANAGER: [
    { href: "/hub", labelKey: "nav_my_hub", icon: "🏭" },
  ],
  TRANSPORTER: [
    { href: "/loadboard", labelKey: "nav_loads", icon: "🚛" },
  ],
  FARMER: [
    { href: "/farmer", labelKey: "nav_dashboard", icon: "🌾" },
  ],
};

export default function Sidebar() {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!userProfile) return null;

  const items = navItems[userProfile.role] || navItems.FARMER;
  const tabs = mobileTabItems[userProfile.role] || mobileTabItems.FARMER;

  return (
    <>
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex-col z-50 shadow-lg">
        {/* Brand */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="block">
            <h1 className="text-2xl font-bold text-primary">Agrocart</h1>
            <p className="text-xs text-muted mt-1 uppercase tracking-wider">{userProfile.role.replace("_", " ")}</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Language + User Info + Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-lg border border-border mb-4">
            {(["en", "ha", "yo", "ig"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                  language === lang 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted hover:text-foreground"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="mb-3">
            <p className="font-semibold text-sm truncate">{userProfile.fullName}</p>
            <p className="text-xs text-muted">{userProfile.phoneNumber}</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="btn btn-outline w-full text-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR (hidden on desktop) ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-primary">Agrocart</h1>
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-medium">{userProfile.fullName?.split(" ")[0]}</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-hover transition"
            aria-label="Menu"
          >
            <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </header>

      {/* ===== MOBILE SLIDE-DOWN MENU ===== */}
      {mobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="lg:hidden fixed top-14 left-0 right-0 bg-surface border-b border-border shadow-xl z-50 animate-fade-in max-h-[70vh] overflow-y-auto">
            <nav className="p-3 flex flex-col gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-lg border border-border mb-4">
                {(["en", "ha", "yo", "ig"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setMobileMenuOpen(false); }}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                      language === lang 
                        ? "bg-primary text-white" 
                        : "text-muted"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { signOut(auth); setMobileMenuOpen(false); }}
                className="btn btn-outline w-full text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      {tabs.length > 1 && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center h-16 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg min-w-[60px] transition ${
                  isActive ? "text-primary" : "text-muted"
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span className="text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] text-center">{t(tab.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
