"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export default function LocationSharing() {
  const { firebaseUser, userProfile } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");

  const updateLocation = useCallback(async (position: GeolocationPosition) => {
    if (!firebaseUser) return;
    const { latitude, longitude } = position.coords;
    setLastPosition({ lat: latitude, lng: longitude });

    try {
      await setDoc(doc(db, "live_locations", firebaseUser.uid), {
        id: firebaseUser.uid,
        name: userProfile?.fullName || "Unknown Driver",
        lat: latitude,
        lng: longitude,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to update location:", err);
    }
  }, [firebaseUser, userProfile]);

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError("");
    const id = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => {
        setError("Location access denied. Please enable GPS.");
        console.error(err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    setWatchId(id);
    setSharing(true);
  };

  const stopSharing = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setSharing(false);
    setLastPosition(null);

    // Remove live location from Firestore
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, "live_locations", firebaseUser.uid));
      } catch (err) {
        console.error("Failed to remove location:", err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="card glass p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">📍 Live GPS Tracking</h3>
          {sharing && lastPosition ? (
            <p className="text-xs text-muted mt-1">
              Sharing: {lastPosition.lat.toFixed(4)}, {lastPosition.lng.toFixed(4)}
            </p>
          ) : (
            <p className="text-xs text-muted mt-1">Share your location so HQ can track deliveries.</p>
          )}
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
        <button
          onClick={sharing ? stopSharing : startSharing}
          className={`btn text-sm ${sharing ? "bg-danger text-white hover:bg-red-600" : "btn-primary"}`}
        >
          {sharing ? "Stop Sharing" : "Start Sharing"}
        </button>
      </div>

      {sharing && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-emerald-600 font-semibold">Live — HQ can see your location</span>
        </div>
      )}
    </div>
  );
}
