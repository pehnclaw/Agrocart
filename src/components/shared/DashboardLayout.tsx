"use client";

import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/shared/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile } = useAuth();

  // Don't show sidebar on public pages or during loading
  const showSidebar = firebaseUser && userProfile;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Desktop: offset for sidebar. Mobile: offset for top bar + bottom tab bar */}
      <div className="flex-1 lg:ml-64 pt-14 pb-20 lg:pt-0 lg:pb-0">
        {children}
      </div>
    </div>
  );
}
