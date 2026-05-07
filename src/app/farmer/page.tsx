"use client";

import MyBatches from "@/components/farmer/MyBatches";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch } from "@/types";
import { calculateAgroScore, getScoreRating } from "@/lib/scoring";

export default function FarmerDashboard() {
  const { userProfile } = useAuth();

  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarmerData() {
      if (!userProfile?.phoneNumber) return;
      const q = query(collection(db, "batches"), where("farmerPhone", "==", userProfile.phoneNumber));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => doc.data() as ProduceBatch);
      setBatches(fetched);
      setLoading(false);
    }
    fetchFarmerData();
  }, [userProfile]);

  const score = calculateAgroScore(batches);
  const rating = getScoreRating(score);
  const totalTons = (batches.reduce((sum, b) => sum + b.weightKg, 0) / 1000).toFixed(2);

  return (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <main className="animate-fade-in p-6 max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl text-primary font-bold">My Farm Dashboard</h1>
            <p className="text-muted">
              Welcome back, <span className="font-semibold text-foreground">{userProfile?.fullName}</span>.
            </p>
          </div>
          <button className="btn btn-outline text-xs">Export Delivery Statement</button>
        </header>

        {/* Financial Inclusion Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 bg-surface shadow-sm border border-border flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">My Agro-Score</p>
            <div className={`w-24 h-24 rounded-full border-8 border-t-primary flex items-center justify-center mb-2`}>
              <span className="text-2xl font-black">{score}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rating.bg} ${rating.color}`}>
              {rating.label} Rating
            </span>
          </div>

          <div className="md:col-span-2 card p-6 bg-primary text-white shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80">Total Volume Delivered</p>
                <h3 className="text-4xl font-black">{totalTons} <span className="text-xl opacity-60">Tons</span></h3>
              </div>
              <span className="text-3xl">🌾</span>
            </div>
            <div className="pt-6 border-t border-white/10 flex gap-8">
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Quality Rate</p>
                <p className="font-bold">{(batches.filter(b => b.grade === "A").length / (batches.length || 1) * 100).toFixed(0)}% Grade A</p>
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Active Batches</p>
                <p className="font-bold">{batches.filter(b => b.status === "AT_HUB").length} At Hub</p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">My Produce Batches</h2>
          <MyBatches />
        </section>
      </main>
    </ProtectedRoute>
  );
}
