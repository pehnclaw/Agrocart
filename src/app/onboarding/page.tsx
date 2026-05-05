"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";

const roleOptions: { value: UserRole; label: string; description: string; icon: string }[] = [
  { value: "FARMER", label: "Farmer", description: "I grow crops and deliver to hubs", icon: "🌾" },
  { value: "HUB_MANAGER", label: "Hub Manager", description: "I manage a collection hub", icon: "🏭" },
  { value: "TRANSPORTER", label: "Transporter", description: "I transport goods between hubs", icon: "🚛" },
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

      // Route based on role
      switch (selectedRole) {
        case "HUB_MANAGER":
          router.replace("/hub");
          break;
        case "TRANSPORTER":
          router.replace("/loadboard");
          break;
        case "FARMER":
          router.replace("/farmer");
          break;
        default:
          router.replace("/");
      }

      // Force a page reload to refresh the auth context
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light opacity-50 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-light opacity-50 blur-[100px]"></div>

      <div className="card glass p-8 w-full max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Agrocart!</h1>
          <p className="text-muted">Let&apos;s set up your profile to get started.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-danger-light text-danger text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="input"
              placeholder="e.g., Musa Abdullahi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === role.value
                      ? "border-primary bg-primary-light/30 shadow-md"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl block mb-2">{role.icon}</span>
                  <span className="font-semibold block text-sm">{role.label}</span>
                  <span className="text-xs text-muted">{role.description}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </main>
  );
}
