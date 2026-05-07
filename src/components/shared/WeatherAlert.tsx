"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  warning?: string;
}

export default function WeatherAlert({ location }: { location: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Simulated weather intelligence
    // In production, fetch from OpenWeatherMap or similar
    const timer = setTimeout(() => {
      const isRainy = Math.random() > 0.7;
      setWeather({
        temp: 28 + Math.floor(Math.random() * 5),
        condition: isRainy ? "Heavy Rain Expected" : "Sunny & Clear",
        humidity: isRainy ? 85 : 45,
        riskLevel: isRainy ? "HIGH" : "LOW",
        warning: isRainy ? "Critical: Potential flood risk at loading bay. Protect all grain batches." : undefined
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [location]);

  if (!weather) return <div className="animate-pulse h-12 bg-surface-hover rounded-xl border border-border"></div>;

  return (
    <div className={`p-4 rounded-xl border transition-all duration-500 flex items-center gap-4 ${
      weather.riskLevel === "HIGH" 
        ? "bg-danger-light border-danger animate-bounce-subtle" 
        : "bg-primary-light border-primary/20"
    }`}>
      <span className="text-2xl">{weather.riskLevel === "HIGH" ? "⛈️" : "☀️"}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="text-sm font-bold">Local Intel: {location}</p>
          <p className="text-xs font-bold uppercase">{weather.temp}°C | {weather.humidity}% Humidity</p>
        </div>
        <p className={`text-xs font-bold ${weather.riskLevel === "HIGH" ? "text-danger" : "text-primary-dark"}`}>
          {weather.condition} {weather.warning ? `— ${weather.warning}` : ""}
        </p>
      </div>
    </div>
  );
}
