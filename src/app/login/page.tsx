"use client";

import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { firebaseUser, userProfile, loading, isNewUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (firebaseUser && isNewUser) {
      router.replace("/onboarding");
    } else if (firebaseUser && userProfile) {
      // Already logged in with profile — send to correct dashboard
      switch (userProfile.role) {
        case "HUB_MANAGER": router.replace("/hub"); break;
        case "ADMIN": router.replace("/hq"); break;
        case "TRANSPORTER": router.replace("/loadboard"); break;
        case "FARMER": router.replace("/farmer"); break;
        default: router.replace("/"); break;
      }
    }
  }, [firebaseUser, userProfile, loading, isNewUser, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (firebaseUser) return null; // Redirecting...

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light opacity-50 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-light opacity-50 blur-[100px]"></div>

      <div className="card glass p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Agrocart</h1>
          <p className="text-muted">Sign in to your Hub or HQ dashboard</p>
        </div>

        <PhoneLoginForm />
      </div>
    </main>
  );
}
