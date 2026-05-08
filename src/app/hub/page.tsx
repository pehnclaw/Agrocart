"use client";

import IntakeForm from "@/components/hub/IntakeForm";
import RecentIntakes from "@/components/hub/RecentIntakes";
import IncomingDeliveries from "@/components/hub/IncomingDeliveries";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WeatherAlert from "@/components/shared/WeatherAlert";
import SiloHealth from "@/components/hub/SiloHealth";
import { useAuth } from "@/contexts/AuthContext";

export default function HubDashboard() {
  const { userProfile } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["HUB_MANAGER", "ADMIN"]}>
      <main className="animate-fade-in p-6 max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl text-primary font-bold">Smart Hub Dashboard</h1>
          <p className="text-muted">
            Welcome, <span className="font-semibold text-foreground">{userProfile?.fullName}</span>. Works offline!
          </p>
        </header>

        <section className="mb-8">
          <WeatherAlert location={userProfile?.hubId || "Regional Hub"} />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <section className="card p-6 glass md:col-span-3 h-fit">
            <h2 className="text-xl font-semibold mb-4">New Produce Intake</h2>
            <IntakeForm />
          </section>

          <section className="flex flex-col gap-8 md:col-span-2">
            <div className="card p-6 h-fit border-primary/20">
              <h2 className="text-xl font-semibold mb-4 text-primary">Incoming Deliveries</h2>
              <IncomingDeliveries />
            </div>

            <div className="card p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">IoT Silo Health</h2>
              <SiloHealth />
            </div>

            <div className="card p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">Recent Intakes</h2>
              <RecentIntakes />
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
