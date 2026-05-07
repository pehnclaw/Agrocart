"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProduceBatch, PurchaseOrder } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CorporateDashboard() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [availableStock, setAvailableStock] = useState<ProduceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    // 1. Fetch Corporate Orders
    const qOrders = query(
      collection(db, "orders"),
      where("buyerId", "==", userProfile.id)
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const fetched: PurchaseOrder[] = [];
      snapshot.forEach((d) => fetched.push({ ...d.data(), id: d.id } as PurchaseOrder));
      setOrders(fetched);
    });

    // 2. Fetch Global Available Stock (Approved & at Hub)
    const qStock = query(
      collection(db, "batches"),
      where("auditStatus", "==", "APPROVED"),
      where("status", "in", ["AT_HUB", "DELIVERED"])
    );
    const unsubStock = onSnapshot(qStock, (snapshot) => {
      const fetched: ProduceBatch[] = [];
      snapshot.forEach((d) => fetched.push({ ...d.data(), id: d.id } as ProduceBatch));
      setAvailableStock(fetched);
      setLoading(false);
    });

    return () => { unsubOrders(); unsubStock(); };
  }, [userProfile]);

  const procurementData = orders.map(o => ({
    name: o.cropType,
    fulfilled: o.currentQuantityKg / 1000,
    target: o.targetQuantityKg / 1000
  }));

  return (
    <ProtectedRoute allowedRoles={["CORPORATE_BUYER", "ADMIN"]}>
      <main className="p-4 md:p-8 animate-fade-in space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-primary">Procurement HQ</h1>
          <p className="text-muted">Monitor your supply chain fulfillment and secure verified inventory.</p>
        </header>

        {/* Procurement Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 bg-surface shadow-md">
            <h3 className="text-lg font-bold mb-6">Fulfillment Progress (Tons)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={procurementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="fulfilled" fill="#16a34a" name="Procured" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#e2e8f0" name="Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6 bg-primary text-white shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm opacity-80 font-bold uppercase tracking-widest">Active Orders</p>
              <h2 className="text-5xl font-black">{orders.filter(o => o.status === "OPEN").length}</h2>
            </div>
            <div className="pt-6 border-t border-white/20">
              <p className="text-xs opacity-80">Total Target Volume</p>
              <p className="text-2xl font-bold">
                {(orders.reduce((sum, o) => sum + o.targetQuantityKg, 0) / 1000).toLocaleString()} Tons
              </p>
            </div>
          </div>
        </div>

        {/* Global Inventory (Verified only) */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold">Verified Market Inventory</h3>
              <p className="text-xs text-muted font-medium">Approved by HQ Quality Vault. Ready for immediate buyout.</p>
            </div>
            <button className="btn btn-outline text-xs">Refresh Market</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableStock.map((batch) => (
              <div key={batch.id} className="card p-5 hover:shadow-lg transition group">
                <div className="flex justify-between items-start mb-4">
                  <span className="badge badge-primary text-[10px] animate-pulse">VERIFIED</span>
                  <span className="text-xs font-bold text-muted">ID: {batch.id.slice(0, 6)}</span>
                </div>
                <h4 className="text-lg font-bold">{batch.cropType}</h4>
                <p className="text-2xl font-black text-primary my-2">{batch.weightKg}kg</p>
                <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-widest pt-4 border-t border-border">
                  <span>Grade {batch.grade}</span>
                  <span>Hub: {batch.originHubId.slice(0, 6)}</span>
                </div>
                <button className="w-full btn btn-primary mt-4 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Add to Procurement
                </button>
              </div>
            ))}
            {availableStock.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted card border-dashed">
                Scanning the network for verified inventory...
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
