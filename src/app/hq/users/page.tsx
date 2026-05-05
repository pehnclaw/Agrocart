"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, UserRole } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  HUB_MANAGER: "Hub Manager",
  TRANSPORTER: "Transporter",
  FARMER: "Farmer",
};

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  HUB_MANAGER: "bg-primary-light text-primary-dark",
  TRANSPORTER: "bg-accent-light text-amber-800",
  FARMER: "bg-emerald-100 text-emerald-700",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetched: User[] = [];
      snapshot.forEach((doc) => fetched.push(doc.data() as User));
      // Sort admins first, then by name
      fetched.sort((a, b) => {
        if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
        if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
        return (a.fullName || "").localeCompare(b.fullName || "");
      });
      setUsers(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Failed to update role. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="animate-fade-in p-6">
        <header className="mb-8">
          <h1 className="text-3xl text-primary font-bold">User Management</h1>
          <p className="text-muted">View all registered users and assign roles. Only Admins can access this page.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="card glass overflow-hidden">
            <div className="p-4 bg-surface border-b border-border flex justify-between items-center">
              <span className="font-semibold">{users.length} Registered Users</span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-hover text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Current Role</th>
                  <th className="p-4 font-semibold">Change Role</th>
                  <th className="p-4 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover transition">
                    <td className="p-4 font-medium">{user.fullName || "—"}</td>
                    <td className="p-4 text-sm font-mono text-muted">{user.phoneNumber}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${roleBadgeColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={updatingId === user.id}
                        className="input text-sm py-1 px-2 w-40"
                      >
                        <option value="FARMER">Farmer</option>
                        <option value="HUB_MANAGER">Hub Manager</option>
                        <option value="TRANSPORTER">Transporter</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-right text-xs text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
