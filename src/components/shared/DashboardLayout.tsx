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
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
