"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip, Vehicle, User } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function FleetDispatch() {
  const { userProfile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicleMap, setSelectedVehicleMap] = useState<Record<string, string>>({});
  const [selectedDriverMap, setSelectedDriverMap] = useState<Record<string, string>>({});
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const fetchDispatchData = async () => {
    if (!userProfile || userProfile.role !== "FLEET_OWNER") return;

    try {
      // Fetch accepted trips that need assignment
      const tripsQ = query(
        collection(db, "trips"),
        where("ownerId", "==", userProfile.id),
        where("status", "in", ["ACCEPTED", "IN_TRANSIT"])
      );
      const tripsSnap = await getDocs(tripsQ);
      setTrips(tripsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Trip)));

      // Fetch Active Vehicles
      const vehiclesQ = query(
        collection(db, "vehicles"),
        where("ownerId", "==", userProfile.id),
        where("status", "==", "ACTIVE")
      );
      const vehiclesSnap = await getDocs(vehiclesQ);
      setVehicles(vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));

      // Fetch Drivers
      const driversQ = query(
        collection(db, "users"),
        where("role", "==", "DRIVER"),
        where("employerId", "==", userProfile.id)
      );
      const driversSnap = await getDocs(driversQ);
      setDrivers(driversSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));

    } catch (error) {
      console.error("Error fetching dispatch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatchData();
  }, [userProfile]);

  const handleDispatch = async (tripId: string) => {
    const vehicleId = selectedVehicleMap[tripId];
    const driverId = selectedDriverMap[tripId];

    if (!vehicleId || !driverId) {
      alert("Please select both a vehicle and a driver.");
      return;
    }

    try {
      setDispatchingId(tripId);
      await updateDoc(doc(db, "trips", tripId), {
        vehicleId,
        driverId,
        status: "IN_TRANSIT",
        updatedAt: Date.now()
      });
      alert("Trip dispatched successfully!");
      await fetchDispatchData();
    } catch (error) {
      console.error("Error dispatching trip:", error);
      alert("Failed to dispatch trip.");
    } finally {
      setDispatchingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dispatch center...</div>;

  const undispatchedTrips = trips.filter(t => t.status === "ACCEPTED" || (!t.vehicleId || !t.driverId));
  const activeDispatchedTrips = trips.filter(t => t.status === "IN_TRANSIT" && t.vehicleId && t.driverId);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in pb-24 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispatch Center</h1>
        <p className="text-muted mt-2">Assign your trucks and drivers to accepted loads.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-amber-500/5">
          <h2 className="text-xl font-bold text-amber-600">Pending Dispatch ({undispatchedTrips.length})</h2>
          <p className="text-sm text-muted mt-1">These loads have been accepted from the Load Board but need a driver.</p>
        </div>
        
        {undispatchedTrips.length === 0 ? (
          <div className="p-8 text-center text-muted">No pending dispatches.</div>
        ) : (
          <div className="p-6 grid grid-cols-1 gap-6">
            {undispatchedTrips.map(trip => (
              <div key={trip.id} className="border border-border rounded-xl p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-background">
                <div>
                  <p className="font-mono text-xs text-muted mb-1">TRIP ID: {trip.id}</p>
                  <p className="font-bold text-lg">{trip.batchIds.length} Batches</p>
                  <p className="text-primary font-bold">{formatCurrency(trip.agreedPrice)}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 md:max-w-xl">
                  <select 
                    className="flex-1 bg-surface border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={selectedVehicleMap[trip.id] || trip.vehicleId || ""}
                    onChange={(e) => setSelectedVehicleMap({...selectedVehicleMap, [trip.id]: e.target.value})}
                  >
                    <option value="" disabled>Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.licensePlate} ({v.capacityTons}T)</option>
                    ))}
                  </select>
                  
                  <select 
                    className="flex-1 bg-surface border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={selectedDriverMap[trip.id] || trip.driverId || ""}
                    onChange={(e) => setSelectedDriverMap({...selectedDriverMap, [trip.id]: e.target.value})}
                  >
                    <option value="" disabled>Select Driver</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.fullName || d.phoneNumber}</option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={() => handleDispatch(trip.id)}
                    disabled={dispatchingId === trip.id}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    {dispatchingId === trip.id ? "Dispatching..." : "Dispatch"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active In Transit */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Currently In Transit ({activeDispatchedTrips.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover text-muted text-sm border-b border-border">
                <th className="p-4 font-medium">Trip ID</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Driver</th>
                <th className="p-4 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {activeDispatchedTrips.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">No active trips.</td>
                </tr>
              ) : (
                activeDispatchedTrips.map(trip => {
                  const assignedVehicle = vehicles.find(v => v.id === trip.vehicleId);
                  const assignedDriver = drivers.find(d => d.id === trip.driverId);
                  
                  return (
                    <tr key={trip.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition">
                      <td className="p-4 font-mono text-xs">{trip.id}</td>
                      <td className="p-4 font-bold">{assignedVehicle?.licensePlate}</td>
                      <td className="p-4">{assignedDriver?.fullName || assignedDriver?.phoneNumber}</td>
                      <td className="p-4 font-medium">{formatCurrency(trip.agreedPrice)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
