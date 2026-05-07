"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Trip, Hub } from "@/types";
import { useEffect, useState } from "react";

// Fix for default marker icons in Leaflet + Next.js
const truckIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const hubIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2163/2163350.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface FleetMapProps {
  trips: Trip[];
  hubs: Hub[];
}

export default function FleetMap({ trips, hubs }: FleetMapProps) {
  // We use a "simulated offset" to show movement even without real GPS updates
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 0.005) % 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getHubCoords = (hubId: string) => {
    const hub = hubs.find(h => h.id === hubId);
    if (hub) return [hub.location.lat, hub.location.lng] as [number, number];
    // Default to a central Nigerian point if hub not found
    return [9.0820, 8.6753] as [number, number];
  };

  return (
    <MapContainer 
      center={[9.0820, 8.6753]} 
      zoom={6} 
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Render Hubs */}
      {hubs.map(hub => (
        <Marker 
          key={hub.id} 
          position={[hub.location.lat, hub.location.lng]} 
          icon={hubIcon}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-bold">{hub.name}</h4>
              <p className="text-xs text-muted">{hub.type} Hub</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render Active Trips with simulated movement */}
      {trips.map(trip => {
        const origin = getHubCoords(trip.originHubId);
        const dest = getHubCoords(trip.destinationHubId);
        
        // Calculate a point along the line based on our "offset"
        // In production, this would be the actual real-time vehicle GPS
        const currentLat = origin[0] + (dest[0] - origin[0]) * offset;
        const currentLng = origin[1] + (dest[1] - origin[1]) * offset;

        return (
          <div key={trip.id}>
            <Polyline 
              positions={[origin, dest]} 
              color="#6366f1" 
              weight={2} 
              dashArray="10, 10" 
              opacity={0.5}
            />
            <Marker 
              position={[currentLat, currentLng]} 
              icon={truckIcon}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <p className="text-[10px] font-bold text-indigo-600 mb-1">TRIP IN PROGRESS</p>
                  <h4 className="font-bold">Trip #{trip.id.slice(0,8)}</h4>
                  <p className="text-xs mt-1">
                    <span className="text-muted">Route:</span> {trip.originHubId.slice(0,5)} → {trip.destinationHubId.slice(0,5)}
                  </p>
                  <p className="text-xs font-bold mt-2">Value: ₦{trip.agreedPrice.toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
}
