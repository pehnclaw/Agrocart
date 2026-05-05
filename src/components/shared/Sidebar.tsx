"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const navItems = {
  ADMIN: [
    { href: "/hq", label: "Control Tower", icon: "📡" },
    { href: "/hq/users", label: "User Management", icon: "👥" },
    { href: "/hub", label: "Hub View", icon: "🏭" },
    { href: "/loadboard", label: "Load Board", icon: "🚛" },
    { href: "/farmer", label: "Farmer View", icon: "🌾" },
  ],
  HUB_MANAGER: [
    { href: "/hub", label: "My Hub", icon: "🏭" },
  ],
  TRANSPORTER: [
    { href: "/loadboard", label: "Load Board", icon: "🚛" },
  ],
  FARMER: [
    { href: "/farmer", label: "My Dashboard", icon: "🌾" },
  ],
};

export default function Sidebar() {
  const { userProfile } = useAuth();
  const pathname = usePathname();

  if (!userProfile) return null;

  const items = navItems[userProfile.role] || navItems.FARMER;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col z-50 shadow-lg">
      {/* Brand */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold text-primary">Agrocart</h1>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider">{userProfile.role.replace("_", " ")}</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-border">
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
  );
}
