"use client";

import IntakeForm from "@/components/hub/IntakeForm";
import RecentIntakes from "@/components/hub/RecentIntakes";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function HubDashboard() {
  const { userProfile } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["HUB_MANAGER", "ADMIN"]}>
      <main className="animate-fade-in p-6 max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-primary font-bold">Smart Hub Dashboard</h1>
            <p className="text-muted">
              Welcome, <span className="font-semibold text-foreground">{userProfile?.fullName}</span>. Works offline!
            </p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="btn btn-outline text-sm"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <section className="card p-6 glass md:col-span-3 h-fit">
            <h2 className="text-xl mb-4">New Produce Intake</h2>
            <IntakeForm />
          </section>

          <section className="card p-6 md:col-span-2 h-fit">
            <h2 className="text-xl mb-4">Recent Intakes</h2>
            <RecentIntakes />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
