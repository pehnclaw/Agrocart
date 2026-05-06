"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";
import Link from "next/link";

const roleOptions: { value: UserRole; label: string; description: string; icon: string; color: string }[] = [
  { value: "FARMER", label: "Farmer", description: "Deliver crops to our hubs", icon: "🌾", color: "border-primary" },
  { value: "HUB_MANAGER", label: "Hub Manager", description: "Manage inventory and waybills", icon: "🏭", color: "border-accent" },
  { value: "TRANSPORTER", label: "Transporter", description: "Move loads across Nigeria", icon: "🚛", color: "border-primary-dark" },
];

export default function OnboardingPage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !selectedRole || !firebaseUser) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await setDoc(doc(db, "users", firebaseUser.uid), {
        id: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber || "",
        fullName,
        role: selectedRole,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Force a page reload to refresh the auth context and trigger routing in LoginPage
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-surface-hover items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary opacity-10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent opacity-10 blur-[120px]"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-primary/30 mx-auto mb-8 animate-bounce">🚜</div>
          <h1 className="text-4xl font-extrabold mb-4">Final Step!</h1>
          <p className="text-muted text-xl max-w-sm mx-auto leading-relaxed">
            Choose your role and enter your name to start using the Agrocart network.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-[1.5] flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-xl">
          <Link href="/" className="md:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">🚜</div>
            <span className="font-bold">Agrocart</span>
          </Link>

          <div className="mb-12">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Complete Your Profile</h2>
            <p className="text-muted text-lg">We need a few details to set up your personalized dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-muted mb-3">Your Full Name</label>
              <input
                type="text"
                className="input text-lg py-4 border-2 focus:border-primary"
                placeholder="e.g., Musa Abdullahi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-muted mb-4">Choose Your Path</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`group relative p-6 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center ${
                      selectedRole === role.value
                        ? `${role.color} bg-white shadow-xl scale-[1.05] z-10`
                        : "border-border hover:border-primary/40 bg-surface/50"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center text-3xl transition-transform duration-500 ${selectedRole === role.value ? "bg-primary/10 rotate-12 scale-110" : "bg-muted/10 group-hover:scale-110"}`}>
                      {role.icon}
                    </div>
                    <p className="font-bold text-lg mb-1">{role.label}</p>
                    <p className="text-[10px] leading-tight text-muted font-medium">{role.description}</p>
                    
                    {selectedRole === role.value && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] shadow-lg animate-fade-in">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-danger-light text-danger text-sm font-medium border border-danger/20 animate-shake">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full py-5 text-lg font-bold shadow-xl shadow-primary/30" disabled={loading}>
              {loading ? "Creating Profile..." : "Start Using Agrocart →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
