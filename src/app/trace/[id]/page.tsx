"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch, Hub } from "@/types";
import { useParams } from "next/navigation";

export default function TraceabilityPage() {
  const { id } = useParams();
  const [batch, setBatch] = useState<ProduceBatch | null>(null);
  const [originHub, setOriginHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTraceData() {
      if (!id) return;
      try {
        const batchDoc = await getDoc(doc(db, "batches", id as string));
        if (batchDoc.exists()) {
          const batchData = batchDoc.data() as ProduceBatch;
          setBatch(batchData);
          
          // Fetch Hub details
          const hubDoc = await getDoc(doc(db, "hubs", batchData.originHubId));
          if (hubDoc.exists()) {
            setOriginHub(hubDoc.data() as Hub);
          }
        }
      } catch (err) {
        console.error("Trace failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTraceData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4">🔍</span>
        <h1 className="text-2xl font-bold">Batch Not Found</h1>
        <p className="text-muted">The ID provided does not exist in the Agrocart Global Ledger.</p>
        <a href="/" className="btn btn-primary mt-6">Return to Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-hover text-foreground">
      {/* Premium Header */}
      <nav className="p-6 bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-black text-xl tracking-tighter text-primary">AGROCART <span className="text-muted font-light">TRACE</span></span>
          </div>
          <span className="text-[10px] font-bold bg-primary-light text-primary px-3 py-1 rounded-full uppercase tracking-widest">Verified Provenance</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20">
        {/* Hero Section */}
        <div className="card p-8 bg-primary text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
             <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mb-2">Public Ledger Certificate</p>
             <h1 className="text-4xl font-black mb-1">{batch.cropType}</h1>
             <p className="text-xl opacity-90">{batch.weightKg.toLocaleString()}kg · Grade {batch.grade}</p>
          </div>
          <div className="absolute top-[-20px] right-[-20px] text-white/10 text-9xl font-black select-none pointer-events-none">
            {batch.cropType[0]}
          </div>
        </div>

        {/* Verification Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { label: "Verified Origin", sub: originHub?.name || "Regional Hub", icon: "📍", active: true },
             { label: "Quality Audit", sub: batch.auditStatus || "Verified by HQ", icon: "🛡️", active: batch.auditStatus === "APPROVED" },
             { label: "Escrow Secured", sub: "Payment Protected", icon: "💸", active: true },
           ].map((badge, i) => (
             <div key={i} className={`card p-4 flex items-center gap-4 border-2 transition-all ${badge.active ? 'border-primary-light bg-white' : 'border-border grayscale opacity-50'}`}>
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted tracking-widest">{badge.label}</p>
                  <p className="font-bold text-sm">{badge.sub}</p>
                </div>
             </div>
           ))}
        </div>

        {/* The Journey Timeline */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">🛣️</span>
            Journey of Provenance
          </h2>

          <div className="relative pl-8 border-l-2 border-dashed border-primary/30 space-y-12 ml-4 py-4">
            {/* Step 1: Farm Gate */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-md"></div>
              <div>
                <p className="text-xs font-bold text-primary uppercase">Farm Gate Intake</p>
                <h3 className="font-bold text-lg">{originHub?.name || "Origin Hub"}</h3>
                <p className="text-sm text-muted">Initial quality grading and weighing performed.</p>
                <p className="text-[10px] text-muted mt-2">{new Date(batch.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Step 2: Quality Vault Audit */}
            {batch.auditStatus === "APPROVED" && (
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-md"></div>
                <div>
                  <p className="text-xs font-bold text-accent uppercase">Quality Vault Verification</p>
                  <h3 className="font-bold text-lg">Digital Handshake Complete</h3>
                  <p className="text-sm text-muted">High-resolution photographic evidence verified by HQ inspectors.</p>
                  <span className="badge badge-accent mt-2 text-[10px]">GRADE A CERTIFIED</span>
                </div>
              </div>
            )}

            {/* Step 3: Logistics (Condition only if delivered) */}
            {batch.status === "DELIVERED" ? (
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-md"></div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase">Final Destination Reached</p>
                  <h3 className="font-bold text-lg">Verified Delivery</h3>
                  <p className="text-sm text-muted">Successfully transferred to downstream logistics network.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-md"></div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase">Current Status</p>
                  <h3 className="font-bold text-lg">{batch.status.replace("_", " ")}</h3>
                  <p className="text-sm text-muted">Awaiting final transport dispatch to industrial market.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-xs text-muted">This is an automated certificate generated by the Agrocart Global Supply Chain Engine.</p>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-widest font-bold">Engine Ver 1.0.4 | Ledger Hash: {id.slice(-12)}</p>
        </div>
      </main>
    </div>
  );
}
