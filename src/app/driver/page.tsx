"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip } from "@/types";

export default function DriverDashboard() {
  const { userProfile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState<string | null>(null);

  const fetchAssignedTrips = async () => {
    if (!userProfile || userProfile.role !== "DRIVER") return;
    try {
      const q = query(
        collection(db, "trips"),
        where("driverId", "==", userProfile.id),
        where("status", "==", "IN_TRANSIT")
      );
      const snap = await getDocs(q);
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip)));
    } catch (error) {
      console.error("Error fetching assigned trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTrips();
  }, [userProfile]);

  const simulateDeliveryScan = async (tripId: string) => {
    setIsScanning(tripId);
    
    // Simulate the time it takes to open camera and scan a QR code at the destination hub
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, "trips", tripId), {
          status: "DELIVERED",
          escrowStatus: "RELEASED",
          updatedAt: Date.now()
        });
        alert("Delivery Confirmed! Escrow released to Fleet Owner.");
        await fetchAssignedTrips();
      } catch (error) {
        console.error("Error confirming delivery", error);
        alert("Delivery failed.");
      } finally {
        setIsScanning(null);
      }
    }, 2000);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading assigned trips...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 animate-fade-in pb-24 lg:pb-6">
      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Driver Console</h1>
        <p className="text-primary-foreground/80 mt-1 text-sm">
          {userProfile?.fullName || userProfile?.phoneNumber}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold px-2">Active Assignments ({trips.length})</h2>
        
        {trips.length === 0 ? (
          <div className="bg-surface p-8 rounded-2xl border border-border text-center text-muted shadow-sm">
            <div className="text-4xl mb-3">☕</div>
            <p>You have no active trips.</p>
            <p className="text-sm mt-1">Wait for your Fleet Owner to dispatch you.</p>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-[10px] font-bold">IN TRANSIT</span>
                  <p className="font-mono text-xs text-muted mt-2">TRIP ID: {trip.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{trip.batchIds.length} Batches</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <button 
                  onClick={() => simulateDeliveryScan(trip.id)}
                  disabled={isScanning === trip.id}
                  className="btn btn-primary w-full h-[60px] text-lg font-bold flex items-center justify-center gap-3"
                >
                  {isScanning === trip.id ? (
                    <>
                      <span className="animate-spin text-xl">⏳</span> Scanning QR...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📷</span> Scan Destination QR
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-muted mt-3">
                  Scan the Hub Manager's QR code upon arrival to confirm delivery and release the escrow payment.
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
