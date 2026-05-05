"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Stats {
  totalBatches: number;
  totalWeightKg: number;
  totalUsers: number;
  totalHubs: number;
  batchesAtHub: number;
  batchesInTransit: number;
  batchesDelivered: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalBatches: 0,
    totalWeightKg: 0,
    totalUsers: 0,
    totalHubs: 0,
    batchesAtHub: 0,
    batchesInTransit: 0,
    batchesDelivered: 0,
  });

  useEffect(() => {
    // Listen to batches
    const unsubBatches = onSnapshot(collection(db, "batches"), (snapshot) => {
      let totalKg = 0;
      let atHub = 0;
      let inTransit = 0;
      let delivered = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalKg += data.weightKg || 0;
        if (data.status === "AT_HUB") atHub++;
        if (data.status === "IN_TRANSIT") inTransit++;
        if (data.status === "DELIVERED") delivered++;
      });
      setStats((prev) => ({
        ...prev,
        totalBatches: snapshot.size,
        totalWeightKg: totalKg,
        batchesAtHub: atHub,
        batchesInTransit: inTransit,
        batchesDelivered: delivered,
      }));
    });

    // Listen to users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Listen to hubs
    const unsubHubs = onSnapshot(collection(db, "hubs"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalHubs: snapshot.size }));
    });

    return () => {
      unsubBatches();
      unsubUsers();
      unsubHubs();
    };
  }, []);

  const cards = [
    { label: "Total Batches", value: stats.totalBatches, icon: "📦", color: "text-primary" },
    { label: "Total Tonnage", value: `${(stats.totalWeightKg / 1000).toFixed(1)}t`, icon: "⚖️", color: "text-foreground" },
    { label: "At Hub", value: stats.batchesAtHub, icon: "🏭", color: "text-amber-600" },
    { label: "In Transit", value: stats.batchesInTransit, icon: "🚛", color: "text-blue-600" },
    { label: "Delivered", value: stats.batchesDelivered, icon: "✅", color: "text-emerald-600" },
    { label: "Registered Users", value: stats.totalUsers, icon: "👥", color: "text-indigo-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card glass p-4 text-center hover:shadow-md transition">
          <span className="text-2xl block mb-2">{card.icon}</span>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-muted mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
