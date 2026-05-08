"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { exportToCSV } from "@/lib/export";

export default function HubInventoryPage() {
  const { userProfile } = useAuth();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const hubId = userProfile.hubId || userProfile.id || "unassigned";

    // Only batches CURRENTLY at this hub
    const q = query(
      collection(db, "batches"),
      where("originHubId", "==", hubId),
      where("status", "==", "AT_HUB")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ProduceBatch[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as ProduceBatch));
      // Sort by oldest first (FIFO - First In, First Out)
      fetched.sort((a, b) => a.createdAt - b.createdAt);
      setBatches(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleExport = () => {
    const exportData = batches.map(b => ({
      BatchID: b.id,
      Crop: b.cropType,
      WeightKg: b.weightKg,
      Grade: b.grade,
      IntakeDate: new Date(b.createdAt).toLocaleDateString(),
      Status: b.status
    }));
    exportToCSV(exportData, "Hub_Inventory_Stock");
  };

  const getAgingInfo = (createdAt: number) => {
    const days = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
    if (days >= 7) return { label: `${days} Days (Critical)`, color: "text-danger bg-danger-light" };
    if (days >= 3) return { label: `${days} Days (Warning)`, color: "text-amber-700 bg-amber-100" };
    return { label: days === 0 ? "Today" : `${days} Day${days > 1 ? 's' : ''}`, color: "text-primary-dark bg-primary-light" };
  };

  return (
    <ProtectedRoute allowedRoles={["HUB_MANAGER", "ADMIN"]}>
      <main className="p-4 md:p-8 animate-fade-in">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary">Live Hub Inventory</h1>
            <p className="text-muted">Manage real-time stock levels and track produce aging.</p>
          </div>
          <button onClick={handleExport} className="btn btn-outline text-xs py-1.5 px-4">
            📥 Export Stock List (.csv)
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="card p-20 text-center text-muted">
            <span className="text-5xl block mb-4">📦</span>
            <p>Your hub inventory is currently empty.</p>
          </div>
        ) : (
          <div className="card glass overflow-hidden border border-border shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-hover text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Crop Type</th>
                  <th className="p-4 font-bold">Weight</th>
                  <th className="p-4 font-bold">Grade</th>
                  <th className="p-4 font-bold">Aging Status</th>
                  <th className="p-4 font-bold">Audit Status</th>
                  <th className="p-4 font-bold text-right">Intake Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((batch) => {
                  const aging = getAgingInfo(batch.createdAt);
                  return (
                    <tr key={batch.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🌾</span>
                          <span className="font-bold text-foreground">{batch.cropType}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{batch.weightKg.toLocaleString()} kg</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          batch.grade === 'A' ? 'bg-primary-light text-primary-dark' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Grade {batch.grade}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${aging.color}`}>
                          {aging.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          batch.auditStatus === "APPROVED" ? "text-primary" : 
                          batch.auditStatus === "REJECTED" ? "text-danger" : "text-muted"
                        }`}>
                          {batch.auditStatus || "UNAUDITED"}
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs text-muted">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="p-4 bg-surface border-t border-border flex justify-between items-center">
              <p className="text-sm font-bold">Total Hub Inventory:</p>
              <p className="text-xl font-extrabold text-primary">
                {(batches.reduce((sum, b) => sum + b.weightKg, 0) / 1000).toFixed(2)} Tons
              </p>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
