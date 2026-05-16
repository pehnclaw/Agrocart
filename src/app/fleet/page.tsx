"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip, Vehicle, User } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function FleetDashboard() {
  const { userProfile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFleetData() {
      if (!userProfile || userProfile.role !== "FLEET_OWNER") return;

      try {
        // Fetch Trips
        const tripsQuery = query(
          collection(db, "trips"),
          where("ownerId", "==", userProfile.id),
          orderBy("createdAt", "desc")
        );
        const tripsSnap = await getDocs(tripsQuery);
        const tripsData = tripsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Trip));
        setTrips(tripsData);

        // Fetch Vehicles
        const vehiclesQuery = query(
          collection(db, "vehicles"),
          where("ownerId", "==", userProfile.id)
        );
        const vehiclesSnap = await getDocs(vehiclesQuery);
        setVehicles(vehiclesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle)));

        // Fetch Drivers
        const driversQuery = query(
          collection(db, "users"),
          where("role", "==", "DRIVER"),
          where("employerId", "==", userProfile.id)
        );
        const driversSnap = await getDocs(driversQuery);
        setDrivers(driversSnap.docs.map((d) => ({ id: d.id, ...d.data() } as User)));

      } catch (error) {
        console.error("Error fetching fleet data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFleetData();
  }, [userProfile]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading fleet data...</div>;

  const totalEarnings = trips
    .filter((t) => t.escrowStatus === "RELEASED")
    .reduce((sum, t) => sum + t.agreedPrice, 0);

  const activeTrips = trips.filter((t) => t.status === "IN_TRANSIT" || t.status === "ACCEPTED").length;
  const completedTrips = trips.filter((t) => t.status === "DELIVERED").length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in pb-24 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fleet Overview</h1>
        <p className="text-muted mt-2">Manage your trucks, drivers, and corporate payouts.</p>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted">Total Payouts (Escrow Released)</p>
          <p className="text-3xl font-bold text-emerald-500 mt-2">{formatCurrency(totalEarnings)}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted">Active Trips</p>
          <p className="text-3xl font-bold text-primary mt-2">{activeTrips}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted">Active Vehicles</p>
          <p className="text-3xl font-bold mt-2">{vehicles.filter(v => v.status === "ACTIVE").length} / {vehicles.length}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted">Registered Drivers</p>
          <p className="text-3xl font-bold mt-2">{drivers.length}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Recent Fleet Activity</h2>
        </div>
        {trips.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p>No trips yet. Head to the Load Board to accept corporate deliveries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover text-muted text-sm border-b border-border">
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Vehicle</th>
                  <th className="p-4 font-medium">Driver</th>
                  <th className="p-4 font-medium">Payout</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trips.slice(0, 5).map((trip) => {
                  const assignedVehicle = vehicles.find(v => v.id === trip.vehicleId);
                  const assignedDriver = drivers.find(d => d.id === trip.driverId);
                  
                  return (
                    <tr key={trip.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition">
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trip.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-500" :
                          trip.status === "IN_TRANSIT" ? "bg-amber-500/10 text-amber-500" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {trip.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{assignedVehicle?.licensePlate || "Unassigned"}</td>
                      <td className="p-4 text-muted">{assignedDriver?.fullName || assignedDriver?.phoneNumber || "Unassigned"}</td>
                      <td className="p-4 font-mono font-medium">{formatCurrency(trip.agreedPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
