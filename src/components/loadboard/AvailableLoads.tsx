"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip } from "@/types";

export default function AvailableLoads() {
  const [loads, setLoads] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch from Firestore `trips` collection
    const q = query(collection(db, "trips"), where("status", "==", "PENDING_BID"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Trip));
      
      if (fetched.length === 0) {
        // Mock data for the MVP
        setLoads([
          {
            id: "load-1",
            originHubId: "Dawanau Mega Hub (Kano)",
            destinationHubId: "Lagos Central Market",
            batchIds: ["batch-x", "batch-y"],
            status: "PENDING_BID",
            agreedPrice: 150000,
            escrowStatus: "HELD",
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          {
            id: "load-2",
            originHubId: "Makurdi Transit Hub (Benue)",
            destinationHubId: "Port Harcourt Depot",
            batchIds: ["batch-z"],
            status: "PENDING_BID",
            agreedPrice: 85000,
            escrowStatus: "HELD",
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ]);
      } else {
        setLoads(fetched);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptLoad = (id: string) => {
    alert(`Load ${id} accepted! Escrow payment locked. Proceed to origin hub for pickup.`);
    // In real app: Update doc status to "ACCEPTED" and set escrowStatus
  };

  if (loading) {
    return <p className="text-muted animate-pulse">Scanning load boards...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {loads.map((load) => (
        <div key={load.id} className="card glass p-6 hover:-translate-y-2 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="badge badge-warning text-xs">Backhaul Opportunity</span>
            <span className="text-xl font-bold text-primary">₦{load.agreedPrice.toLocaleString()}</span>
          </div>
          
          <div className="mb-6 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <p className="font-semibold">{load.originHubId}</p>
            </div>
            <div className="w-0.5 h-6 bg-border ml-1.5 mb-2"></div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent border-2 border-background"></div>
              <p className="font-semibold">{load.destinationHubId}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted">{load.batchIds.length} Batches (Pooled)</p>
            <button 
              onClick={() => handleAcceptLoad(load.id)}
              className="btn btn-primary shadow-lg shadow-primary/30"
            >
              Accept Load
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
