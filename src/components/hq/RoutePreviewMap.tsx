"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const hubIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2163/2163350.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface RoutePreviewMapProps {
  originCoords: [number, number];
  destCoords: [number, number];
  distanceKm: number;
}

// Map bounds updater component
function MapBoundsUpdater({ origin, dest }: { origin: [number, number], dest: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (origin && dest) {
      const bounds = L.latLngBounds([origin, dest]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [map, origin, dest]);
  return null;
}

export default function RoutePreviewMap({ originCoords, destCoords, distanceKm }: RoutePreviewMapProps) {
  // Safe default
  const center = originCoords || [9.0820, 8.6753];

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-border shadow-inner relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        className="w-full h-full z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {originCoords && destCoords && (
          <MapBoundsUpdater origin={originCoords} dest={destCoords} />
        )}

        {originCoords && (
          <Marker position={originCoords} icon={hubIcon}>
            <Popup>Origin Hub</Popup>
          </Marker>
        )}

        {destCoords && (
          <Marker position={destCoords} icon={hubIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {originCoords && destCoords && (
          <Polyline 
            positions={[originCoords, destCoords]} 
            color="#0ea5e9" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.8}
          />
        )}
      </MapContainer>

      {distanceKm > 0 && (
        <div className="absolute bottom-4 right-4 z-[400] bg-surface text-foreground px-4 py-2 rounded-xl shadow-lg border border-border font-bold">
          {distanceKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
        </div>
      )}
    </div>
  );
}
