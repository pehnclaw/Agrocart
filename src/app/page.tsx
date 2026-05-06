"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-surface/80 backdrop-blur-md border-b border-border py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <span className="text-xl">🚜</span>
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">Agrocart</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-lg border border-border">
              {(["en", "ha", "yo", "ig"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                    language === lang 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="hidden md:block">
              <Link href="/login" className="btn btn-outline py-2 px-6 text-sm font-bold border-2">
                {t("login")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center -z-10 scale-105 animate-slow-zoom" 
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent -z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Empowering 10,000+ Nigerian Farmers
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              {t("hero_title")}
            </h1>
            <p className="text-xl text-muted max-w-lg mb-10 leading-relaxed">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="btn btn-primary px-8 py-4 text-lg font-bold shadow-xl shadow-primary/30 group">
                {t("get_started")}
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link href="#features" className="btn btn-outline px-8 py-4 text-lg font-bold border-2 backdrop-blur-sm hover:bg-surface/50">
                {t("learn_more")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Value Props */}
      <section className="py-24 bg-surface/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tailored for the Ecosystem</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Different tools for different roles, one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Farmer Card */}
            <div className="card glass p-8 group hover:-translate-y-2 transition-all duration-500 border-b-4 border-b-primary/30 hover:border-b-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🌾</div>
              <h3 className="text-2xl font-bold mb-3">{t("farmer_title")}</h3>
              <p className="text-muted leading-relaxed mb-6">{t("farmer_desc")}</p>
              <ul className="space-y-2 mb-8 text-sm">
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Instant Payouts</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Market Access</li>
                <li className="flex items-center gap-2"><span className="text-primary">✓</span> Transparent Grading</li>
              </ul>
            </div>

            {/* Hub Card */}
            <div className="card glass p-8 group hover:-translate-y-2 transition-all duration-500 border-b-4 border-b-accent/30 hover:border-b-accent">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🏭</div>
              <h3 className="text-2xl font-bold mb-3">{t("hub_title")}</h3>
              <p className="text-muted leading-relaxed mb-6">{t("hub_desc")}</p>
              <ul className="space-y-2 mb-8 text-sm">
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> Offline Intake</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> QR Waybills</li>
                <li className="flex items-center gap-2"><span className="text-accent">✓</span> Inventory Control</li>
              </ul>
            </div>

            {/* Transporter Card */}
            <div className="card glass p-8 group hover:-translate-y-2 transition-all duration-500 border-b-4 border-b-primary-dark/30 hover:border-b-primary-dark">
              <div className="w-14 h-14 bg-primary-dark/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🚛</div>
              <h3 className="text-2xl font-bold mb-3">{t("transporter_title")}</h3>
              <p className="text-muted leading-relaxed mb-6">{t("transporter_desc")}</p>
              <ul className="space-y-2 mb-8 text-sm">
                <li className="flex items-center gap-2"><span className="text-primary-dark">✓</span> Backhaul Loads</li>
                <li className="flex items-center gap-2"><span className="text-primary-dark">✓</span> Escrow Security</li>
                <li className="flex items-center gap-2"><span className="text-primary-dark">✓</span> Smart Routing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">{t("features_title")}</h2>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">📡</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{t("feature_tracking")}</h4>
                    <p className="text-muted">Know exactly where your cargo is at every moment with real-time GPS telemetry.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">💾</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{t("feature_offline")}</h4>
                    <p className="text-muted">Works in remote areas with zero signal. Data syncs automatically once you hit the highway.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-primary-dark rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">🔒</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{t("feature_escrow")}</h4>
                    <p className="text-muted">Payments are held in secure escrow and released only upon verified digital handshake.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl border border-border overflow-hidden p-8 flex items-center justify-center">
                <div className="text-9xl animate-bounce">🌍</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/30 blur-3xl rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold">Agrocart</span>
          </div>
          <p className="text-muted text-sm">{t("footer_text")}</p>
          <div className="flex gap-6 text-sm font-bold">
            <Link href="/privacy" className="hover:text-primary">{t("privacy_policy")}</Link>
            <Link href="/terms" className="hover:text-primary">{t("terms_of_service")}</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
