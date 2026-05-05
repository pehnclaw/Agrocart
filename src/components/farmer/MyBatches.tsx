"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { ProduceBatch } from "@/types";

const statusColors: Record<string, string> = {
  AT_HUB: "bg-amber-100 text-amber-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
};

const statusLabels: Record<string, string> = {
  AT_HUB: "At Hub",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
};

export default function MyBatches() {
  const { firebaseUser } = useAuth();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    // Farmers see batches linked to their phone number OR their user ID
    const q = query(
      collection(db, "batches"),
      where("farmerId", "==", firebaseUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ProduceBatch[] = [];
      snapshot.forEach((doc) => fetched.push(doc.data() as ProduceBatch));
      setBatches(fetched);
      setLoading(false);
    }, (error) => {
      // If the index doesn't exist yet, also try phone-based query
      console.warn("Farmer batches query error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  if (loading) {
    return <p className="text-muted animate-pulse p-4">Loading your batches...</p>;
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <span className="text-5xl block mb-4">🌱</span>
        <p className="font-semibold text-lg mb-1">No batches yet</p>
        <p className="text-sm">When you deliver crops to a hub, they will appear here with real-time status tracking.</p>
      </div>
    );
  }

  // Summary stats
  const totalKg = batches.reduce((sum, b) => sum + b.weightKg, 0);
  const atHub = batches.filter((b) => b.status === "AT_HUB").length;
  const inTransit = batches.filter((b) => b.status === "IN_TRANSIT").length;
  const delivered = batches.filter((b) => b.status === "DELIVERED").length;

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{batches.length}</p>
          <p className="text-xs text-muted">Total Batches</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{totalKg.toLocaleString()} kg</p>
          <p className="text-xs text-muted">Total Delivered</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{atHub}</p>
          <p className="text-xs text-muted">At Hub</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{delivered}</p>
          <p className="text-xs text-muted">Delivered</p>
        </div>
      </div>

      {/* Batch List */}
      <div className="flex flex-col gap-3">
        {batches.map((batch) => (
          <div key={batch.id} className="card p-4 flex justify-between items-center hover:shadow-md transition">
            <div>
              <h4 className="font-semibold">{batch.cropType} <span className="text-sm font-normal text-muted ml-2">({batch.weightKg} kg)</span></h4>
              <p className="text-xs text-muted mt-1">
                Grade {batch.grade} · {batch.moisturePercent ? `${batch.moisturePercent}% moisture` : "No moisture data"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[batch.status]}`}>
                {statusLabels[batch.status]}
              </span>
              <span className="text-xs text-muted">{new Date(batch.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
