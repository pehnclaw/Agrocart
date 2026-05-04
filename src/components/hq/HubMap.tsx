"use client";

import dynamic from "next/dynamic";

// Dynamically import the Map component with SSR disabled
// Leaflet requires the window object to be defined, which fails during Next.js SSR
const DynamicMap = dynamic(() => import("./Map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-hover animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-muted">Loading Map Engine...</p>
    </div>
  )
});

export default function HubMap() {
  return (
    <div className="card glass p-2 w-full h-[400px] md:h-[600px] relative z-0">
      <DynamicMap />
    </div>
  );
}
