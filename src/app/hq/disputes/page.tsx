"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "trips"),
      where("escrowStatus", "==", "DISPUTED")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Trip));
      fetched.sort((a, b) => b.updatedAt - a.updatedAt);
      setDisputes(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolve = async (tripId: string, decision: "RELEASED" | "HELD") => {
    const reason = window.prompt(`Explain the resolution for this dispute (${decision}):`);
    if (!reason) return;

    setProcessingId(tripId);
    try {
      await updateDoc(doc(db, "trips", tripId), {
        escrowStatus: decision,
        resolutionNotes: reason,
        resolvedAt: Date.now(),
        updatedAt: Date.now()
      });
      alert(`Dispute resolved as ${decision}.`);
    } catch (err) {
      console.error(err);
      alert("Failed to resolve dispute.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="p-4 md:p-8 animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dispute Mediation Center</h1>
          <p className="text-muted">Review logistics conflicts and make final escrow decisions.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : disputes.length === 0 ? (
          <div className="card p-20 text-center text-muted">
            <span className="text-5xl block mb-4">⚖️</span>
            <p>No active disputes in the network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {disputes.map((trip) => (
              <div key={trip.id} className="card p-6 border-l-4 border-l-danger bg-surface hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge bg-danger text-white text-[10px] uppercase font-bold">CONFLICT</span>
                      <h3 className="font-bold">Trip #{trip.id.slice(0, 8)}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-danger-light/30 p-4 rounded-xl border border-danger/10">
                        <p className="text-xs font-bold text-danger uppercase mb-1">Hub Manager's Reason:</p>
                        <p className="text-sm italic">"{(trip as any).disputeReason || "No reason provided"}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted font-bold uppercase">Transporter ID</p>
                          <p>{trip.vehicleId || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-muted font-bold uppercase">Load Value</p>
                          <p className="font-bold text-primary">₦{trip.agreedPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3 md:w-64">
                    <p className="text-xs text-center text-muted font-medium mb-2">Mediation Actions</p>
                    <button 
                      onClick={() => handleResolve(trip.id, "RELEASED")}
                      disabled={processingId === trip.id}
                      className="btn btn-primary py-3 text-xs"
                    >
                      Release to Transporter
                    </button>
                    <button 
                      onClick={() => handleResolve(trip.id, "HELD")}
                      disabled={processingId === trip.id}
                      className="btn btn-outline border-danger text-danger py-3 text-xs"
                    >
                      Hold for Investigation
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
