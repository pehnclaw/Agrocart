"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Trip } from "@/types";

export default function AvailableLoads() {
  const { firebaseUser, userProfile } = useAuth();
  const [loads, setLoads] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "trips"), where("status", "==", "PENDING_BID"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Trip));
      setLoads(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptLoad = async (tripId: string) => {
    if (!firebaseUser) return;
    setAccepting(tripId);

    try {
      await updateDoc(doc(db, "trips", tripId), {
        status: "ACCEPTED",
        vehicleId: firebaseUser.uid,
        transporterPhone: userProfile?.phoneNumber || "",
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to accept load:", err);
      alert("Failed to accept load. Please try again.");
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return <p className="text-muted animate-pulse">Scanning load boards...</p>;
  }

  if (loads.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <span className="text-5xl block mb-4">🛣️</span>
        <p className="font-semibold text-lg mb-1">No loads available right now</p>
        <p className="text-sm">New loads will appear here when HQ dispatches trips.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {loads.map((load) => (
        <div key={load.id} className="card glass p-5 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="badge badge-warning text-xs">Backhaul Opportunity</span>
            <span className="text-xl font-bold text-primary">₦{load.agreedPrice.toLocaleString()}</span>
          </div>
          
          {/* Route visualization */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary shrink-0"></div>
              <p className="font-semibold text-sm truncate">{load.originHubId.slice(0, 20)}</p>
            </div>
            <div className="w-0.5 h-5 bg-border ml-1.5"></div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-3 h-3 rounded-full bg-accent shrink-0"></div>
              <p className="font-semibold text-sm truncate">{load.destinationHubId.slice(0, 20)}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted">{load.batchIds.length} Batches</p>
            <button 
              onClick={() => handleAcceptLoad(load.id)}
              disabled={accepting === load.id}
              className="btn btn-primary text-sm py-2 px-4"
            >
              {accepting === load.id ? "Accepting..." : "Accept Load"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
