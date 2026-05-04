"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch } from "@/types";

export default function RecentIntakes() {
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, originHubId would be the logged-in user's hub ID
    const q = query(
      collection(db, "batches"),
      where("originHubId", "==", "placeholder-hub-id"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedBatches: ProduceBatch[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBatches.push(doc.data() as ProduceBatch);
      });
      setBatches(fetchedBatches);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching batches: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-muted animate-pulse">Loading recent intakes...</p>;
  }

  if (batches.length === 0) {
    return <p className="text-muted">No intakes recorded yet. They will appear here when offline or online.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {batches.map((batch) => (
        <div key={batch.id} className="flex justify-between items-center p-4 border border-border rounded-lg bg-surface hover:bg-surface-hover transition">
          <div>
            <h4 className="font-semibold text-primary">{batch.cropType} <span className="text-sm font-normal text-muted ml-2">({batch.weightKg}kg)</span></h4>
            <p className="text-xs text-muted mt-1">Farmer: {batch.farmerPhone}</p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className={`badge ${batch.grade === 'A' ? 'badge-primary' : 'badge-warning'}`}>
              Grade {batch.grade}
            </span>
            <span className="text-xs text-muted">
              {batch.moisturePercent ? `${batch.moisturePercent}% Moisture` : 'No Moisture Data'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
