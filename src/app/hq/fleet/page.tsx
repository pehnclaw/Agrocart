"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip, Hub } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Dynamic import for the Map component to avoid SSR issues with Leaflet
const FleetMap = dynamic(() => import("@/components/hq/FleetMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-surface-hover animate-pulse rounded-2xl flex items-center justify-center border border-border">
      <p className="text-muted font-bold tracking-widest">INITIALIZING GLOBAL TELEMETRY...</p>
    </div>
  )
});

export default function FleetPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Hubs for reference
    const unsubHubs = onSnapshot(collection(db, "hubs"), (snapshot) => {
      const fetched: Hub[] = [];
      snapshot.forEach((d) => fetched.push({ ...d.data(), id: d.id } as Hub));
      setHubs(fetched);
    });

    // 2. Fetch Active Trips
    const q = query(collection(db, "trips"), where("status", "in", ["ACCEPTED", "IN_TRANSIT"]));
    const unsubTrips = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((d) => fetched.push({ ...d.data(), id: d.id } as Trip));
      setTrips(fetched);
      setLoading(false);
    });

    return () => {
      unsubHubs();
      unsubTrips();
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="p-4 md:p-8 space-y-6 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Live Fleet Telemetry</h1>
            <p className="text-muted">Real-time GPS tracking of active logistics dispatches.</p>
          </div>
          <div className="flex gap-4">
            <div className="card px-4 py-2 bg-surface shadow-sm border border-border flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-sm font-bold">{trips.length} Active Loads</span>
            </div>
          </div>
        </header>

        <section className="relative h-[70vh] w-full rounded-2xl overflow-hidden border border-border shadow-2xl">
          {!loading && <FleetMap trips={trips} hubs={hubs} />}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {trips.map(trip => (
             <div key={trip.id} className="card p-4 bg-surface border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">TRIP #{trip.id.slice(0,8)}</p>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <p className="text-sm font-bold truncate">Route: {trip.originHubId.slice(0,8)} → {trip.destinationHubId.slice(0,8)}</p>
                <div className="mt-3 w-full bg-surface-hover h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-1/2 animate-shimmer"></div>
                </div>
             </div>
           ))}
           {trips.length === 0 && (
             <div className="col-span-full py-8 text-center text-muted card border-dashed">
               No active trips currently in transit.
             </div>
           )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
