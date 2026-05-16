"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Vehicle } from "@/types";

export default function FleetVehicles() {
  const { userProfile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  const fetchVehicles = async () => {
    if (!userProfile || userProfile.role !== "FLEET_OWNER") return;
    try {
      const q = query(collection(db, "vehicles"), where("ownerId", "==", userProfile.id));
      const snap = await getDocs(q);
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [userProfile]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !newPlate || !newCapacity) return;

    try {
      setIsAdding(true);
      await addDoc(collection(db, "vehicles"), {
        licensePlate: newPlate.toUpperCase(),
        capacityTons: Number(newCapacity),
        ownerId: userProfile.id,
        status: "ACTIVE",
        verificationStatus: "PENDING",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setNewPlate("");
      setNewCapacity("");
      await fetchVehicles();
    } catch (error) {
      console.error("Error adding vehicle:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleStatus = async (vehicleId: string, currentStatus: "ACTIVE" | "MAINTENANCE") => {
    const newStatus = currentStatus === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
    try {
      await updateDoc(doc(db, "vehicles", vehicleId), {
        status: newStatus,
        updatedAt: Date.now()
      });
      setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading vehicles...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-24 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
        <p className="text-muted mt-2">Register and manage your fleet of trucks.</p>
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Add New Truck</h2>
        <form onSubmit={handleAddVehicle} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-muted mb-1">License Plate</label>
            <input
              type="text"
              required
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value)}
              placeholder="e.g. KAN-123-XA"
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-muted mb-1">Capacity (Tons)</label>
            <input
              type="number"
              required
              min="1"
              max="50"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              placeholder="e.g. 15"
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button 
            type="submit" 
            disabled={isAdding}
            className="btn btn-primary w-full md:w-auto h-[50px] px-8"
          >
            {isAdding ? "Adding..." : "Add Truck"}
          </button>
        </form>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Registered Fleet ({vehicles.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover text-muted text-sm border-b border-border">
                <th className="p-4 font-medium">License Plate</th>
                <th className="p-4 font-medium">Capacity</th>
                <th className="p-4 font-medium">Verification</th>
                <th className="p-4 font-medium text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">No vehicles registered yet.</td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition">
                    <td className="p-4 font-mono font-bold">{vehicle.licensePlate}</td>
                    <td className="p-4">{vehicle.capacityTons} Tons</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        vehicle.verificationStatus === "VERIFIED" ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        {vehicle.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleStatus(vehicle.id, vehicle.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          vehicle.status === "ACTIVE" 
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }`}
                      >
                        {vehicle.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
