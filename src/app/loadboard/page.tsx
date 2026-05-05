"use client";

import AvailableLoads from "@/components/loadboard/AvailableLoads";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function LoadBoardPage() {
  const { userProfile } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["TRANSPORTER", "ADMIN"]}>
      <main className="animate-fade-in p-6 min-h-screen">
        <header className="mb-8 bg-surface p-8 rounded-2xl shadow-sm border border-border flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-primary font-bold mb-2">Transporter Load Board</h1>
            <p className="text-muted text-lg">
              Welcome, <span className="font-semibold text-foreground">{userProfile?.fullName}</span>. Find loads and earn.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Active Escrow Wallet</p>
            <p className="text-2xl font-bold">₦0.00</p>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-bold mb-2">Available Loads Nearby</h2>
          <p className="text-muted">Pooled loads optimized for your current route.</p>
          <AvailableLoads />
        </section>
      </main>
    </ProtectedRoute>
  );
}
