"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Trip } from "@/types";
import { sendAgrocartSMS, SMSTemplates } from "@/lib/sms";

export default function IncomingDeliveries() {
  const { userProfile } = useAuth();
  const [incomingTrips, setIncomingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    const hubId = userProfile.hubId || userProfile.id || "unassigned";

    // Query for trips where THIS hub is the destination AND it is IN_TRANSIT
    const q = query(
      collection(db, "trips"),
      where("destinationHubId", "==", hubId),
      where("status", "==", "IN_TRANSIT")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Trip[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Trip));
      setIncomingTrips(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleReceiveDelivery = async (trip: Trip) => {
    if (!window.confirm(`Confirm receipt of Trip ${trip.id.slice(0, 8)}? This will release the escrow payment to the transporter.`)) {
      return;
    }

    setReceivingId(trip.id);

    try {
      // 1. Update the trip status to DELIVERED and escrow to RELEASED
      await updateDoc(doc(db, "trips", trip.id), {
        status: "DELIVERED",
        escrowStatus: "RELEASED",
        updatedAt: Date.now()
      });

      // 2. Update all associated batches to DELIVERED
      const batchPromises = trip.batchIds.map((batchId) => 
        updateDoc(doc(db, "batches", batchId), {
          status: "DELIVERED",
          updatedAt: Date.now()
        })
      );
      
      await Promise.all(batchPromises);

      // Trigger SMS to Transporter (Escrow Released)
      const transporterPhone = (trip as any).transporterPhone;
      if (transporterPhone) {
        await sendAgrocartSMS(
          transporterPhone,
          SMSTemplates.deliveryComplete(trip.id)
        );
      }

      alert("Delivery received successfully! Escrow released.");
    } catch (error) {
      console.error("Error receiving delivery:", error);
      alert("Failed to process receipt. Please try again.");
    } finally {
      setReceivingId(null);
    }
  };

  const handleDispute = async (trip: Trip) => {
    const reason = window.prompt("Why are you disputing this delivery? (e.g. Damaged goods, incorrect weight)");
    if (!reason) return;

    setReceivingId(trip.id);
    try {
      await updateDoc(doc(db, "trips", trip.id), {
        status: "DELIVERED", // Still delivered but disputed
        escrowStatus: "DISPUTED",
        disputeReason: reason,
        disputedAt: Date.now(),
        updatedAt: Date.now()
      });
      alert("Dispute filed. HQ will review the evidence.");
    } catch (err) {
      console.error(err);
      alert("Failed to file dispute.");
    } finally {
      setReceivingId(null);
    }
  };

  if (loading) {
    return <p className="text-muted animate-pulse">Scanning for incoming trucks...</p>;
  }

  if (incomingTrips.length === 0) {
    return (
      <div className="text-center py-6 text-muted border border-dashed border-border rounded-xl">
        <span className="text-3xl block mb-2">📭</span>
        <p>No incoming deliveries at the moment.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {incomingTrips.map((trip) => (
        <div key={trip.id} className="card p-5 border border-primary/20 bg-primary/5 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="badge badge-primary mb-2 text-xs animate-pulse">INBOUND TRUCK</span>
              <h3 className="font-bold">Trip #{trip.id.slice(0, 8)}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Escrow Value</p>
              <p className="font-bold text-lg text-primary">₦{trip.agreedPrice.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="text-sm mb-4">
            <p><span className="text-muted">From:</span> {trip.originHubId}</p>
            <p><span className="text-muted">Payload:</span> {trip.batchIds.length} Batches</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => handleDispute(trip)}
              disabled={receivingId === trip.id}
              className="flex-1 btn btn-outline border-danger text-danger py-3 text-sm"
            >
              Dispute
            </button>
            <button 
              onClick={() => handleReceiveDelivery(trip)}
              disabled={receivingId === trip.id}
              className="flex-2 btn btn-primary py-3 text-sm shadow-md"
            >
              {receivingId === trip.id ? "Processing..." : "Verify & Receive"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
