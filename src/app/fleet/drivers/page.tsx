"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/types";

export default function FleetDrivers() {
  const { userProfile } = useAuth();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  const fetchDrivers = async () => {
    if (!userProfile || userProfile.role !== "FLEET_OWNER") return;
    try {
      const q = query(
        collection(db, "users"), 
        where("role", "==", "DRIVER"),
        where("employerId", "==", userProfile.id)
      );
      const snap = await getDocs(q);
      setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [userProfile]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !newPhone || !newName) return;

    try {
      setIsAdding(true);
      
      // We create a placeholder user document. 
      // When the driver actually logs in via SMS OTP, they will claim this record.
      await addDoc(collection(db, "users"), {
        phoneNumber: newPhone,
        fullName: newName,
        role: "DRIVER",
        employerId: userProfile.id,
        verificationStatus: "PENDING",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      setNewPhone("");
      setNewName("");
      await fetchDrivers();
    } catch (error) {
      console.error("Error adding driver:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading drivers...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-24 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Drivers</h1>
        <p className="text-muted mt-2">Register hired drivers. They will need to log into the app using their phone number to perform delivery handshakes.</p>
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Register New Driver</h2>
        <form onSubmit={handleAddDriver} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Musa Ibrahim"
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +2348012345678"
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button 
            type="submit" 
            disabled={isAdding}
            className="btn btn-primary w-full md:w-auto h-[50px] px-8"
          >
            {isAdding ? "Adding..." : "Add Driver"}
          </button>
        </form>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Registered Drivers ({drivers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover text-muted text-sm border-b border-border">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Phone Number</th>
                <th className="p-4 font-medium">Verification Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted">No drivers registered yet.</td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition">
                    <td className="p-4 font-bold">{driver.fullName}</td>
                    <td className="p-4 font-mono">{driver.phoneNumber}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        driver.verificationStatus === "VERIFIED" ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        {driver.verificationStatus || "UNVERIFIED"}
                      </span>
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
