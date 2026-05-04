"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch } from "@/types";

export default function InventoryVault() {
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FEFO Logic (First-Expired, First-Out)
    // We sort by createdAt ASCENDING, so the oldest (closest to expiring) batches appear first.
    const q = query(
      collection(db, "batches"),
      orderBy("createdAt", "asc") 
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedBatches: ProduceBatch[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBatches.push(doc.data() as ProduceBatch);
      });
      setBatches(fetchedBatches);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching HQ batches: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="card glass p-6 h-full flex items-center justify-center">
        <p className="text-muted animate-pulse">Syncing National Inventory...</p>
      </div>
    );
  }

  return (
    <div className="card glass overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
        <h2 className="text-xl font-bold">Inventory Vault (FEFO Sorted)</h2>
        <span className="badge badge-primary">{batches.length} Batches Tracked</span>
      </div>
      
      <div className="overflow-x-auto flex-1 p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover text-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Crop</th>
              <th className="p-4 font-semibold">Weight</th>
              <th className="p-4 font-semibold">Grade</th>
              <th className="p-4 font-semibold">Moisture</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Hub ID</th>
              <th className="p-4 font-semibold text-right">Age (Days)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">No inventory found nationwide.</td>
              </tr>
            ) : (
              batches.map((batch) => {
                const ageInDays = Math.floor((Date.now() - batch.createdAt) / (1000 * 60 * 60 * 24));
                const isUrgent = ageInDays > 3 && (batch.cropType.toLowerCase() === 'yam' || batch.cropType.toLowerCase() === 'tomato');

                return (
                  <tr key={batch.id} className={`hover:bg-surface-hover transition ${isUrgent ? 'bg-danger-light/20' : ''}`}>
                    <td className="p-4 font-medium">{batch.cropType}</td>
                    <td className="p-4">{batch.weightKg} kg</td>
                    <td className="p-4">
                      <span className={`badge ${batch.grade === 'A' ? 'badge-primary' : 'badge-warning'}`}>
                        {batch.grade}
                      </span>
                    </td>
                    <td className="p-4">{batch.moisturePercent ? `${batch.moisturePercent}%` : '-'}</td>
                    <td className="p-4">
                      <span className="text-xs uppercase tracking-wider text-muted font-bold">
                        {batch.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-muted">{batch.originHubId.slice(0, 8)}...</td>
                    <td className={`p-4 text-right font-bold ${isUrgent ? 'text-danger' : ''}`}>
                      {ageInDays}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
