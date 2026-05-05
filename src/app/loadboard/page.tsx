"use client";

import AvailableLoads from "@/components/loadboard/AvailableLoads";
import MyTrips from "@/components/loadboard/MyTrips";
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Loads — 2/3 width */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-2">Available Loads Nearby</h2>
            <p className="text-muted mb-4">Pooled loads optimized for your current route.</p>
            <AvailableLoads />
          </section>

          {/* My Trips — 1/3 width */}
          <section>
            <h2 className="text-2xl font-bold mb-2">My Trips</h2>
            <p className="text-muted mb-4">Your active and completed deliveries.</p>
            <MyTrips />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
