"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function VerificationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // We want to see users who are NOT yet verified
    const q = query(
      collection(db, "users"),
      where("verificationStatus", "in", ["PENDING", "UNVERIFIED"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: User[] = [];
      snapshot.forEach((doc) => fetched.push({ ...doc.data(), id: doc.id } as User));
      setUsers(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVerify = async (userId: string, status: "VERIFIED" | "REJECTED") => {
    setProcessingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        verificationStatus: status,
        updatedAt: Date.now()
      });
    } catch (err) {
      console.error(err);
      alert("Verification update failed.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <main className="p-4 md:p-8 animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">KYC Verification Portal</h1>
          <p className="text-muted">Review and approve business documents for farmers and transporters.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="card p-20 text-center text-muted">
            <span className="text-5xl block mb-4">🆔</span>
            <p>No pending verifications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user.id} className="card p-6 bg-surface hover:shadow-xl transition">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary-light text-primary flex items-center justify-center rounded-full font-black text-xl">
                    {user.fullName?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold">{user.fullName}</h3>
                    <p className="text-xs text-muted">{user.role}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-surface-hover p-3 rounded-lg">
                    <p className="text-[10px] text-muted font-bold uppercase mb-1">Phone Number</p>
                    <p className="text-sm font-medium">{user.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-muted font-bold uppercase mb-2">Attached Documents</p>
                    {user.documentUrls && user.documentUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                         {user.documentUrls.map((url, i) => (
                           <a key={i} href={url} target="_blank" className="block aspect-square bg-black/5 rounded-md overflow-hidden relative group">
                             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-[10px] text-white font-bold">VIEW</span>
                             </div>
                             <img src={url} alt="KYC Doc" className="w-full h-full object-cover" />
                           </a>
                         ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted">No documents uploaded yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleVerify(user.id, "REJECTED")}
                    disabled={processingId === user.id}
                    className="flex-1 btn btn-outline border-danger text-danger py-2 text-xs"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleVerify(user.id, "VERIFIED")}
                    disabled={processingId === user.id}
                    className="flex-1 btn btn-primary py-2 text-xs"
                  >
                    Verify User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
