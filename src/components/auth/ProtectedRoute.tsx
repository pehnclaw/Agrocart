"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Optional: restrict to specific roles
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { firebaseUser, userProfile, loading, isNewUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in at all → go to login
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    // Logged in but no profile → go to onboarding
    if (isNewUser) {
      router.replace("/onboarding");
      return;
    }

    // Logged in with profile, but wrong role
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
      router.replace("/"); // Send them home
      return;
    }
  }, [firebaseUser, userProfile, loading, isNewUser, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading Agrocart...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || isNewUser) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
