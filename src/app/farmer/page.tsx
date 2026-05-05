"use client";

import MyBatches from "@/components/farmer/MyBatches";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function FarmerDashboard() {
  const { userProfile } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <main className="animate-fade-in p-6 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl text-primary font-bold">My Farm Dashboard</h1>
          <p className="text-muted">
            Welcome, <span className="font-semibold text-foreground">{userProfile?.fullName}</span>. Track your produce from hub to market.
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-4">My Produce Batches</h2>
          <MyBatches />
        </section>
      </main>
    </ProtectedRoute>
  );
}
