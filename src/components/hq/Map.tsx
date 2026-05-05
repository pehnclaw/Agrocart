"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Hub } from "@/types";

// Fix for default Leaflet markers in Next.js
const hubIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom truck icon for live transporters
const truckIcon = L.divIcon({
  html: '<div style="font-size:24px;">🚛</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  className: '',
});

interface LiveLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  updatedAt: number;
  tripId?: string;
}

export default function Map() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [liveLocations, setLiveLocations] = useState<LiveLocation[]>([]);

  useEffect(() => {
    // Fetch all hubs in real-time
    const unsubHubs = onSnapshot(collection(db, "hubs"), (snapshot) => {
      const fetchedHubs: Hub[] = [];
      snapshot.forEach((doc) => fetchedHubs.push({ ...doc.data(), id: doc.id } as Hub));
      setHubs(fetchedHubs);
    });

    // Fetch live transporter locations
    const unsubLocations = onSnapshot(collection(db, "live_locations"), (snapshot) => {
      const fetched: LiveLocation[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as LiveLocation));
      setLiveLocations(fetched);
    });

    return () => { unsubHubs(); unsubLocations(); };
  }, []);

  // Center on Nigeria
  const center: [number, number] = [9.0820, 8.6753];

  return (
    <MapContainer center={center} zoom={6} className="w-full h-full rounded-xl z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Hub Markers */}
      {hubs.map((hub) => (
        <Marker key={hub.id} position={[hub.location.lat, hub.location.lng]} icon={hubIcon}>
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-primary m-0">{hub.name}</h3>
              <p className="text-xs text-muted m-0 mt-1">{hub.type} HUB · {hub.capacityTons}t capacity</p>
              {hub.location.w3w && (
                <p className="text-xs m-0 mt-2 font-mono bg-surface-hover p-1 rounded inline-block">
                  ///{hub.location.w3w}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Hub Coverage Circles */}
      {hubs.map((hub) => (
        <Circle
          key={`circle-${hub.id}`}
          center={[hub.location.lat, hub.location.lng]}
          radius={30000}
          pathOptions={{ color: "#16a34a", fillColor: "#bbf7d0", fillOpacity: 0.15, weight: 1 }}
        />
      ))}

      {/* Live Transporter Locations */}
      {liveLocations.map((loc) => {
        const ageMinutes = (Date.now() - loc.updatedAt) / (1000 * 60);
        if (ageMinutes > 30) return null; // Only show recent locations (< 30 min old)

        return (
          <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={truckIcon}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold m-0">{loc.name}</h3>
                <p className="text-xs text-muted m-0 mt-1">
                  Last update: {Math.floor(ageMinutes)} min ago
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
