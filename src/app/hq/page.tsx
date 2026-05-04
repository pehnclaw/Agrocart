"use client";

import HubMap from "@/components/hq/HubMap";
import InventoryVault from "@/components/hq/InventoryVault";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function HQDashboard() {
  const { userProfile } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="animate-fade-in p-6 min-h-screen flex flex-col max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-primary font-bold">HQ Control Tower</h1>
            <p className="text-muted">
              Welcome, <span className="font-semibold text-foreground">{userProfile?.fullName}</span>. National overview.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-outline">Analytics Report</button>
            <button className="btn btn-primary">Dispatch Trucks</button>
            <button onClick={() => signOut(auth)} className="btn btn-outline text-sm">
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <section className="lg:col-span-2 flex flex-col">
            <HubMap />
          </section>
          <section className="lg:col-span-1 h-[400px] md:h-[600px]">
            <InventoryVault />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
