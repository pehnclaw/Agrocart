"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Hub, User } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { v4 as uuidv4 } from "uuid";

export default function HubManagementPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [hubManagers, setHubManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New hub form state
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [w3w, setW3w] = useState("");
  const [type, setType] = useState<"OWNED" | "PARTNERED">("OWNED");
  const [capacityTons, setCapacityTons] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubHubs = onSnapshot(collection(db, "hubs"), (snapshot) => {
      const fetched: Hub[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as Hub));
      setHubs(fetched);
      setLoading(false);
    });

    // Fetch all hub managers to populate assignment dropdown
    const q = query(collection(db, "users"), where("role", "==", "HUB_MANAGER"));
    const unsubManagers = onSnapshot(q, (snapshot) => {
      const fetched: User[] = [];
      snapshot.forEach((doc) => fetched.push(doc.data() as User));
      setHubManagers(fetched);
    });

    return () => { unsubHubs(); unsubManagers(); };
  }, []);

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const hubId = uuidv4();
      const hubData: Hub = {
        id: hubId,
        name,
        location: { lat: Number(lat), lng: Number(lng), w3w: w3w || "" },
        type,
        managerId: "",
        capacityTons: Number(capacityTons),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, "hubs", hubId), hubData);
      setShowForm(false);
      setName(""); setLat(""); setLng(""); setW3w(""); setCapacityTons("");
    } catch (err) {
      console.error(err);
      alert("Failed to create hub.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignManager = async (hubId: string, managerId: string) => {
    try {
      // Update hub with manager
      await updateDoc(doc(db, "hubs", hubId), { managerId, updatedAt: Date.now() });
      // Update user with hubId
      if (managerId) {
        await updateDoc(doc(db, "users", managerId), { hubId, updatedAt: Date.now() });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to assign manager.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="animate-fade-in p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-primary font-bold">Hub Management</h1>
            <p className="text-muted">Create hubs and assign managers to them.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Create New Hub"}
          </button>
        </header>

        {/* Create Hub Form */}
        {showForm && (
          <div className="card glass p-6 mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">New Hub</h2>
            <form onSubmit={handleCreateHub} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Hub Name *</label>
                <input required className="input" placeholder="e.g., Dawanau Mega Hub (Kano)" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Latitude *</label>
                <input required type="number" step="any" className="input" placeholder="12.0022" value={lat} onChange={(e) => setLat(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude *</label>
                <input required type="number" step="any" className="input" placeholder="8.5920" value={lng} onChange={(e) => setLng(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What3Words Address</label>
                <input className="input" placeholder="filled.count.soap" value={w3w} onChange={(e) => setW3w(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (Tons) *</label>
                <input required type="number" min="1" className="input" placeholder="500" value={capacityTons} onChange={(e) => setCapacityTons(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hub Type *</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value as "OWNED" | "PARTNERED")}>
                  <option value="OWNED">Owned</option>
                  <option value="PARTNERED">Partnered</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                  {saving ? "Creating..." : "Create Hub"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hubs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="card glass overflow-hidden">
            <div className="p-4 bg-surface border-b border-border">
              <span className="font-semibold">{hubs.length} Hubs Registered</span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-hover text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Hub Name</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Capacity</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Assigned Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hubs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted">No hubs created yet. Click &quot;Create New Hub&quot; to add one.</td></tr>
                ) : (
                  hubs.map((hub) => (
                    <tr key={hub.id} className="hover:bg-surface-hover transition">
                      <td className="p-4 font-medium">{hub.name}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${hub.type === "OWNED" ? "bg-primary-light text-primary-dark" : "bg-accent-light text-amber-800"}`}>
                          {hub.type}
                        </span>
                      </td>
                      <td className="p-4">{hub.capacityTons}t</td>
                      <td className="p-4 text-xs font-mono text-muted">
                        {hub.location.lat.toFixed(4)}, {hub.location.lng.toFixed(4)}
                        {hub.location.w3w && <span className="block mt-1">///{hub.location.w3w}</span>}
                      </td>
                      <td className="p-4">
                        <select
                          className="input text-sm py-1 px-2"
                          value={hub.managerId || ""}
                          onChange={(e) => handleAssignManager(hub.id, e.target.value)}
                        >
                          <option value="">-- Unassigned --</option>
                          {hubManagers.map((mgr) => (
                            <option key={mgr.id} value={mgr.id}>
                              {mgr.fullName} ({mgr.phoneNumber})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
