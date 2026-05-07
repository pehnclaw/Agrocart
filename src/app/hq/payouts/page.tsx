"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PayoutsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // We only care about trips that have RELEASED escrow (Ready for payout)
    const q = query(
      collection(db, "trips"),
      where("escrowStatus", "==", "RELEASED")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Trip));
      fetched.sort((a, b) => b.updatedAt - a.updatedAt);
      setTrips(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkPaid = async (tripId: string) => {
    const reference = window.prompt("Enter Bank Transfer Reference (e.g., Session ID):");
    if (!reference) return;

    setProcessingId(tripId);
    try {
      await updateDoc(doc(db, "trips", tripId), {
        payoutStatus: "PAID",
        payoutReference: reference,
        payoutDate: Date.now(),
        updatedAt: Date.now()
      });
    } catch (err) {
      console.error("Payout update failed:", err);
      alert("Failed to update payout status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTrips = trips.filter(t => {
    if (filter === "ALL") return true;
    if (filter === "PAID") return t.payoutStatus === "PAID";
    return !t.payoutStatus || t.payoutStatus === "PENDING";
  });

  const totalPending = trips
    .filter(t => !t.payoutStatus || t.payoutStatus === "PENDING")
    .reduce((sum, t) => sum + t.agreedPrice, 0);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="p-4 md:p-8 animate-fade-in">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Financial Ledger</h1>
            <p className="text-muted">Manage escrow disbursements and payout reconciliations.</p>
          </div>
          
          <div className="card px-6 py-4 bg-primary text-white shadow-xl shadow-primary/20 flex flex-col items-center">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Total Pending Payouts</p>
            <p className="text-2xl font-black">₦{totalPending.toLocaleString()}</p>
          </div>
        </header>

        <div className="flex gap-2 mb-6 bg-surface-hover p-1 rounded-xl w-fit border border-border">
          {(["ALL", "PENDING", "PAID"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? "bg-white shadow-sm text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="card p-20 text-center text-muted">
            <span className="text-5xl block mb-4">💸</span>
            <p>No trips found matching this payout status.</p>
          </div>
        ) : (
          <div className="card glass overflow-hidden border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-hover text-muted text-[10px] uppercase tracking-widest font-bold">
                  <th className="p-4">Trip ID / Transporter</th>
                  <th className="p-4 text-center">Batches</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Escrow Status</th>
                  <th className="p-4">Payout Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm">#{trip.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted truncate max-w-[150px]">{trip.vehicleId || "Unknown Driver"}</p>
                    </td>
                    <td className="p-4 text-center font-semibold text-sm">{trip.batchIds.length}</td>
                    <td className="p-4">
                      <p className="font-black text-primary">₦{trip.agreedPrice.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                        {trip.escrowStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {trip.payoutStatus === "PAID" ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-primary">PAID ✅</span>
                          <span className="text-[8px] text-muted truncate max-w-[100px]">Ref: {trip.payoutReference}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600">WAITING ⏳</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {trip.payoutStatus !== "PAID" && (
                        <button 
                          onClick={() => handleMarkPaid(trip.id)}
                          disabled={processingId === trip.id}
                          className="btn btn-primary py-1.5 px-4 text-[10px]"
                        >
                          {processingId === trip.id ? "Processing..." : "Mark as Paid"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
