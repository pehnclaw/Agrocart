"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import { predictHubDemand, getConfidenceScore } from "@/lib/ai-predict";

const COLORS = ["#16a34a", "#f59e0b", "#166534", "#ef4444", "#64748b"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({
    tonnageByHub: [],
    cropDistribution: [],
    monthlyGrowth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      // In a real app, you might use a Cloud Function to aggregate this.
      // For now, we'll fetch real data and do basic client-side aggregation.
      try {
        const batchesSnapshot = await getDocs(collection(db, "batches"));
        const batches = batchesSnapshot.docs.map(doc => doc.data());

        // Aggregate Tonnage by Hub
        const hubMap: any = {};
        const cropMap: any = {};
        
        batches.forEach((batch: any) => {
          // Hub Tonnage
          const hubName = batch.hubName || "Unknown";
          hubMap[hubName] = (hubMap[hubName] || 0) + (batch.weight || 0);
          
          // Crop Distro
          const crop = batch.cropType || "Other";
          cropMap[crop] = (cropMap[crop] || 0) + 1;
        });

        const prediction = predictHubDemand(batches as any);
        const confidence = getConfidenceScore(batches as any);

        setData({
          prediction,
          confidence,
          tonnageByHub: Object.entries(hubMap).map(([name, value]) => ({ name, value })),
          cropDistribution: Object.entries(cropMap).map(([name, value]) => ({ name, value })),
          monthlyGrowth: [
            { name: "Jan", tons: 45 },
            { name: "Feb", tons: 52 },
            { name: "Mar", tons: 89 },
            { name: "Apr", tons: 124 },
            { name: "May", tons: 180 }
          ]
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
          <p className="text-muted">Real-time performance metrics across the Agrocart network.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20">
          Live Sync Active
        </div>
      </header>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Network Tonnage", value: "482.5 Tons", trend: "+12%", color: "text-primary" },
          { label: "Predicted Next Week", value: `${(data.prediction / 1000).toFixed(1)} Tons`, trend: data.confidence, color: "text-accent" },
          { label: "Active Hubs", value: "14 Units", trend: "0%", color: "text-accent" },
          { label: "Avg Handshake Time", value: "4.2 Hrs", trend: "-15%", color: "text-primary" },
        ].map((kpi, i) => (
          <div key={i} className="card p-6 bg-surface shadow-sm border border-border">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</h3>
              <span className={`text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-primary' : 'text-danger'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tonnage By Hub */}
        <div className="card p-6 bg-surface shadow-md">
          <h3 className="text-lg font-bold mb-6">Tonnage by Hub (Current)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tonnageByHub}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  cursor={{ fill: "rgba(22, 163, 74, 0.05)" }}
                />
                <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop Distribution */}
        <div className="card p-6 bg-surface shadow-md">
          <h3 className="text-lg font-bold mb-6">Crop Portfolio Mix</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.cropDistribution}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.cropDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trend */}
        <div className="card p-6 bg-surface shadow-md lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Monthly Volume Growth (Tons)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="tons" 
                  stroke="#16a34a" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: "#16a34a", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
