"use client";

import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { firebaseUser, userProfile, loading, isNewUser } = useAuth();
  const { t } = useLanguage();
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
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (firebaseUser) return null; // Redirecting...

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Brand/Hero Side (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-primary-dark">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay" 
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-dark/80 to-transparent" />
        
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🚜</span>
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">Agrocart</span>
          </Link>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Connecting the <span className="text-accent underline decoration-4 underline-offset-8">Nigerian</span> Harvest.
          </h2>
          <p className="text-white/80 text-xl leading-relaxed mb-12">
            Join thousands of farmers, hubs, and transporters building the future of African agro-logistics.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-accent font-bold text-2xl mb-1">10k+</p>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Active Farmers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-accent font-bold text-2xl mb-1">500+</p>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Global Hubs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Brand */}
        <div className="md:hidden mb-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-primary/30 mb-4">🚜</div>
          <h1 className="text-3xl font-extrabold text-primary">Agrocart</h1>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
            <p className="text-muted">Enter your phone number to sign in securely.</p>
          </div>

          <div className="card glass p-6 border-2 border-primary/10 shadow-xl shadow-primary/5">
            <PhoneLoginForm />
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Don't have an account? <span className="text-primary font-bold">Sign up now</span>
          </p>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 text-xs text-muted text-center w-full">
          Secure phone authentication powered by Firebase
        </div>
      </div>
    </main>
  );
}
