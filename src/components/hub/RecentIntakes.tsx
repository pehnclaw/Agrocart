"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { ProduceBatch } from "@/types";

export default function RecentIntakes() {
  const { userProfile } = useAuth();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    // Hub Manager sees only their hub's batches
    const hubId = userProfile.hubId || userProfile.id || "unassigned";
    
    const q = query(
      collection(db, "batches"),
      where("originHubId", "==", hubId),
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
  }, [userProfile]);

  if (loading) {
    return <p className="text-muted animate-pulse">Loading recent intakes...</p>;
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <span className="text-3xl block mb-2">📦</span>
        <p>No intakes recorded yet at this hub.</p>
      </div>
    );
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
