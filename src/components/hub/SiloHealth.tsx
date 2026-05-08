"use client";

import { useEffect, useState } from "react";

interface SiloSensor {
  id: string;
  temp: number;
  moisture: number;
  status: "OPTIMAL" | "WARNING" | "CRITICAL";
}

export default function SiloHealth() {
  const [sensors, setSensors] = useState<SiloSensor[]>([
    { id: "Silo-A", temp: 24, moisture: 12, status: "OPTIMAL" },
    { id: "Silo-B", temp: 29, moisture: 14.5, status: "WARNING" }
  ]);

  useEffect(() => {
    // Simulated IoT Telemetry Jitter
    const interval = setInterval(() => {
      setSensors(prev => prev.map(s => {
        const jitter = (Math.random() - 0.5) * 0.5;
        const newTemp = s.temp + jitter;
        const newMoisture = s.moisture + (jitter * 0.1);
        
        let status: "OPTIMAL" | "WARNING" | "CRITICAL" = "OPTIMAL";
        if (newMoisture > 15 || newTemp > 32) status = "CRITICAL";
        else if (newMoisture > 14 || newTemp > 30) status = "WARNING";

        return { ...s, temp: newTemp, moisture: newMoisture, status };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {sensors.map(s => (
        <div key={s.id} className={`p-4 rounded-xl border-2 transition-all ${
          s.status === "CRITICAL" ? "bg-danger-light border-danger animate-pulse" : 
          s.status === "WARNING" ? "bg-amber-50 border-amber-400" : "bg-white border-border"
        }`}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm tracking-tight">{s.id}</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              s.status === "CRITICAL" ? "bg-danger text-white" : 
              s.status === "WARNING" ? "bg-amber-500 text-white" : "bg-primary text-white"
            }`}>
              {s.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted font-bold uppercase">Temperature</p>
              <p className="text-xl font-black">{s.temp.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="text-[10px] text-muted font-bold uppercase">Moisture</p>
              <p className="text-xl font-black">{s.moisture.toFixed(1)}%</p>
            </div>
          </div>

          {s.status === "CRITICAL" && (
            <p className="text-[10px] font-bold text-danger mt-3">⚠️ ALERT: High risk of spoilage. Activate ventilation.</p>
          )}
        </div>
      ))}
    </div>
  );
}
