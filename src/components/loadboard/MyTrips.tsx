"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Trip } from "@/types";

const statusColors: Record<string, string> = {
  PENDING_BID: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
};

export default function MyTrips() {
  const { firebaseUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const q = query(
      collection(db, "trips"),
      where("vehicleId", "==", firebaseUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Trip));
      setTrips(fetched);
      setLoading(false);
    }, (error) => {
      console.warn("MyTrips query error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  if (loading) {
    return <p className="text-muted animate-pulse p-4">Loading your trips...</p>;
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <span className="text-3xl block mb-2">🛣️</span>
        <p className="font-semibold mb-1">No trips yet</p>
        <p className="text-sm">Accept a load from the board above to start earning.</p>
      </div>
    );
  }

  // Stats
  const active = trips.filter((t) => t.status === "ACCEPTED" || t.status === "IN_TRANSIT").length;
  const completed = trips.filter((t) => t.status === "DELIVERED").length;
  const totalEarned = trips
    .filter((t) => t.status === "DELIVERED")
    .reduce((sum, t) => sum + t.agreedPrice, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{active}</p>
          <p className="text-xs text-muted">Active Trips</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-xs text-muted">Completed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary">₦{totalEarned.toLocaleString()}</p>
          <p className="text-xs text-muted">Total Earned</p>
        </div>
      </div>

      {/* Trip List */}
      <div className="flex flex-col gap-3">
        {trips.map((trip) => (
          <div key={trip.id} className="card p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[trip.status]}`}>
                {trip.status.replace("_", " ")}
              </span>
              <span className="font-bold text-lg">₦{trip.agreedPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>{trip.originHubId}</span>
              <span className="text-muted mx-2">→</span>
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span>{trip.destinationHubId}</span>
            </div>
            <p className="text-xs text-muted mt-2">{trip.batchIds.length} batches · {new Date(trip.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
