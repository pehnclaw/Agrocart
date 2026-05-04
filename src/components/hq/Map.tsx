"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Hub } from "@/types";

// Fix for default Leaflet markers in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map() {
  const [hubs, setHubs] = useState<Hub[]>([]);

  useEffect(() => {
    // Fetch all hubs in real-time
    const unsubscribe = onSnapshot(collection(db, "hubs"), (snapshot) => {
      const fetchedHubs: Hub[] = [];
      snapshot.forEach((doc) => fetchedHubs.push({ ...doc.data(), id: doc.id } as Hub));
      
      // If db is empty, add some mock hubs for the MVP demonstration
      if (fetchedHubs.length === 0) {
        setHubs([
          {
            id: "hub-1",
            name: "Dawanau Mega Hub (Kano)",
            location: { lat: 12.0022, lng: 8.5920, w3w: "filled.count.soap" },
            type: "OWNED",
            managerId: "mgr-1",
            capacityTons: 1000,
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          {
            id: "hub-2",
            name: "Makurdi Transit Hub (Benue)",
            location: { lat: 7.7322, lng: 8.5223, w3w: "river.yam.market" },
            type: "PARTNERED",
            managerId: "mgr-2",
            capacityTons: 500,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ]);
      } else {
        setHubs(fetchedHubs);
      }
    });

    return () => unsubscribe();
  }, []);

  // Center on Nigeria
  const center: [number, number] = [9.0820, 8.6753];

  return (
    <MapContainer center={center} zoom={6} className="w-full h-full rounded-xl z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hubs.map((hub) => (
        <Marker key={hub.id} position={[hub.location.lat, hub.location.lng]} icon={icon}>
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-primary m-0">{hub.name}</h3>
              <p className="text-xs text-muted m-0 mt-1">{hub.type} HUB</p>
              <p className="text-xs m-0 mt-2 font-mono bg-surface-hover p-1 rounded inline-block">///{hub.location.w3w}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
