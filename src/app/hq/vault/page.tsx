"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";

export default function QualityVaultPage() {
  const { userProfile } = useAuth();
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    // We only care about batches that HAVE photos for the vault
    const q = query(
      collection(db, "batches"), 
      where("photoUrl", "!=", null)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ProduceBatch[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as ProduceBatch));
      // Sort by newest first
      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setBatches(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAudit = async (batchId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateDoc(doc(db, "batches", batchId), {
        auditStatus: status,
        auditorId: userProfile?.id,
        updatedAt: Date.now()
      });
    } catch (err) {
      console.error("Audit failed:", err);
      alert("Failed to update audit status.");
    }
  };

  const filteredBatches = batches.filter(b => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return !b.auditStatus || b.auditStatus === "PENDING";
    return b.auditStatus === filter;
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="p-4 md:p-8 animate-fade-in">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Quality Vault Audit</h1>
            <p className="text-muted">Review high-resolution intake evidence for compliance.</p>
          </div>
          
          <div className="flex bg-surface-hover p-1 rounded-xl border border-border">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f ? "bg-white shadow-sm text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="card p-20 text-center text-muted">
            <span className="text-5xl block mb-4">📸</span>
            <p>No batches found matching this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <div key={batch.id} className="card overflow-hidden bg-surface group hover:shadow-xl transition-all duration-300">
                {/* Image Section */}
                <div className="relative aspect-video bg-surface-hover overflow-hidden">
                  {batch.photoUrl ? (
                    <img 
                      src={batch.photoUrl} 
                      alt={batch.cropType}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-sm italic">
                      No image available
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`badge shadow-lg ${
                      batch.auditStatus === "APPROVED" ? "badge-primary" : 
                      batch.auditStatus === "REJECTED" ? "bg-danger text-white" : "badge-warning"
                    }`}>
                      {batch.auditStatus || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{batch.cropType}</h3>
                      <p className="text-xs text-muted">ID: {batch.id.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{batch.weightKg}kg</p>
                      <p className="text-xs font-bold text-amber-600">Grade {batch.grade}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => handleAudit(batch.id, "REJECTED")}
                      disabled={batch.auditStatus === "REJECTED"}
                      className="flex-1 btn btn-outline border-danger text-danger hover:bg-danger-light py-2 text-xs"
                    >
                      Reject Grade
                    </button>
                    <button 
                      onClick={() => handleAudit(batch.id, "APPROVED")}
                      disabled={batch.auditStatus === "APPROVED"}
                      className="flex-1 btn btn-primary py-2 text-xs"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
