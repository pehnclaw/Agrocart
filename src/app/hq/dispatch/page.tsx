"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch, Trip, Hub } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { v4 as uuidv4 } from "uuid";
import { sendAgrocartSMS } from "@/lib/sms";
import { getDocs, collection, query, where } from "firebase/firestore";

export default function DispatchPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [availableBatches, setAvailableBatches] = useState<ProduceBatch[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispatch form state
  const [showForm, setShowForm] = useState(false);
  const [originHubId, setOriginHubId] = useState("");
  const [destinationHubId, setDestinationHubId] = useState("");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [smartBroadcast, setSmartBroadcast] = useState(true);

  useEffect(() => {
    const unsubHubs = onSnapshot(collection(db, "hubs"), (snapshot) => {
      const fetched: Hub[] = [];
      snapshot.forEach((d) => fetched.push({ ...d.data(), id: d.id } as Hub));
      setHubs(fetched);
    });

    const batchQ = query(collection(db, "batches"), where("status", "==", "AT_HUB"));
    const unsubBatches = onSnapshot(batchQ, (snapshot) => {
      const fetched: ProduceBatch[] = [];
      snapshot.forEach((d) => fetched.push(d.data() as ProduceBatch));
      setAvailableBatches(fetched);
      setLoading(false);
    });

    const unsubTrips = onSnapshot(collection(db, "trips"), (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((d) => fetched.push({ ...d.data(), id: d.id } as Trip));
      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setTrips(fetched);
    });

    return () => { unsubHubs(); unsubBatches(); unsubTrips(); };
  }, []);

  const filteredBatches = originHubId
    ? availableBatches.filter((b) => b.originHubId === originHubId)
    : availableBatches;

  const toggleBatch = (id: string) => {
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originHubId || !destinationHubId || selectedBatches.length === 0 || !price) return;

    setSaving(true);
    try {
      const tripId = uuidv4();
      const tripData: Trip = {
        id: tripId,
        originHubId,
        destinationHubId,
        batchIds: selectedBatches,
        status: "PENDING_BID",
        agreedPrice: Number(price),
        escrowStatus: "HELD",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, "trips", tripId), tripData);

      // Update batch statuses to reflect they're queued for transport
      for (const batchId of selectedBatches) {
        await updateDoc(doc(db, "batches", batchId), { status: "IN_TRANSIT", updatedAt: Date.now() });
      }

      // Smart Broadcast: Find verified transporters and notify them
      if (smartBroadcast) {
        const transportersQ = query(
          collection(db, "users"), 
          where("role", "==", "TRANSPORTER"),
          where("verificationStatus", "==", "VERIFIED")
        );
        const transportersSnapshot = await getDocs(transportersQ);
        const transporters = transportersSnapshot.docs.map(d => d.data());
        
        const message = `Agrocart: New Load available! ${getHubName(originHubId)} → ${getHubName(destinationHubId)}. Payout: ₦${Number(price).toLocaleString()}. Log in to accept.`;
        
        // In production, we'd batch this or use a Cloud Function
        for (const t of transporters) {
          if (t.phoneNumber) {
            await sendAgrocartSMS(t.phoneNumber, message);
          }
        }
      }

      setShowForm(false);
      setSelectedBatches([]);
      setPrice("");
    } catch (err) {
      console.error(err);
      alert("Failed to create trip.");
    } finally {
      setSaving(false);
    }
  };

  const getHubName = (id: string) => hubs.find((h) => h.id === id)?.name || id.slice(0, 8) + "...";

  const statusColors: Record<string, string> = {
    PENDING_BID: "bg-amber-100 text-amber-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_TRANSIT: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="animate-fade-in p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-primary font-bold">Trip Dispatch</h1>
            <p className="text-muted">Pool batches into loads and dispatch to transporters.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create Trip"}
          </button>
        </header>

        {/* Create Trip Form */}
        {showForm && (
          <div className="card glass p-6 mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">New Trip</h2>
            <form onSubmit={handleCreateTrip}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Origin Hub *</label>
                  <select required className="input" value={originHubId} onChange={(e) => { setOriginHubId(e.target.value); setSelectedBatches([]); }}>
                    <option value="">Select origin...</option>
                    {hubs.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destination Hub *</label>
                  <select required className="input" value={destinationHubId} onChange={(e) => setDestinationHubId(e.target.value)}>
                    <option value="">Select destination...</option>
                    {hubs.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agreed Price (₦) *</label>
                  <input required type="number" min="1000" className="input" placeholder="150000" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              {/* Batch Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Select Batches to Pool ({selectedBatches.length} selected)
                </label>
                {filteredBatches.length === 0 ? (
                  <p className="text-muted text-sm p-4 bg-surface-hover rounded-lg">
                    {originHubId ? "No batches available at this hub." : "Select an origin hub first."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                    {filteredBatches.map((batch) => (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => toggleBatch(batch.id)}
                        className={`p-3 rounded-lg border-2 text-left text-sm transition-all cursor-pointer ${
                          selectedBatches.includes(batch.id)
                            ? "border-primary bg-primary-light/30"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="font-semibold">{batch.cropType}</span>
                        <span className="text-muted ml-2">{batch.weightKg}kg</span>
                        <span className={`block mt-1 text-xs ${batch.grade === "A" ? "text-primary" : "text-amber-600"}`}>
                          Grade {batch.grade}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="checkbox" 
                  id="broadcast" 
                  checked={smartBroadcast} 
                  onChange={(e) => setSmartBroadcast(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="broadcast" className="text-sm font-bold text-primary flex items-center gap-2">
                  🚀 Enable Smart Broadcast (Notify Verified Transporters via SMS)
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving || selectedBatches.length === 0}>
                {saving ? "Creating..." : `Dispatch ${selectedBatches.length} Batches`}
              </button>
            </form>
          </div>
        )}

        {/* Existing Trips */}
        <div className="card glass overflow-hidden">
          <div className="p-4 bg-surface border-b border-border">
            <span className="font-semibold">{trips.length} Trips Created</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-hover text-muted text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Route</th>
                <th className="p-4 font-semibold">Batches</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Escrow</th>
                <th className="p-4 font-semibold text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trips.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted">No trips yet. Pool batches and dispatch them above.</td></tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-surface-hover transition">
                    <td className="p-4">
                      <span className="font-medium">{getHubName(trip.originHubId)}</span>
                      <span className="text-muted mx-2">→</span>
                      <span className="font-medium">{getHubName(trip.destinationHubId)}</span>
                    </td>
                    <td className="p-4">{trip.batchIds.length}</td>
                    <td className="p-4 font-bold">₦{trip.agreedPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[trip.status]}`}>
                        {trip.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-muted uppercase">{trip.escrowStatus}</td>
                    <td className="p-4 text-right text-xs text-muted">{new Date(trip.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedRoute>
  );
}
