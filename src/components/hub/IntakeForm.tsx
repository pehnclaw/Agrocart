"use client";

import { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react";
import { ProduceBatch } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { sendAgrocartSMS, SMSTemplates } from "@/lib/sms";

export default function IntakeForm() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successBatchId, setSuccessBatchId] = useState<string | null>(null);
  
  // Form State
  const [farmerPhone, setFarmerPhone] = useState("");
  const [cropType, setCropType] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [grade, setGrade] = useState<"A" | "B" | "C">("A");
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const uploadPhotoToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.warn("Cloudinary env vars missing. Photo will not be uploaded.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = undefined;

      if (photo) {
        setUploadStatus("Uploading photo...");
        photoUrl = await uploadPhotoToCloudinary(photo) || undefined;
      }

      setUploadStatus("Saving to database...");
      const batchId = uuidv4();
      
      const batchData: ProduceBatch = {
        id: batchId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        farmerPhone,
        cropType,
        weightKg: Number(weightKg),
        moisturePercent: moisturePercent ? Number(moisturePercent) : undefined,
        grade,
        photoUrl,
        status: "AT_HUB",
        // Use the logged-in hub manager's assigned hub, fallback to their user ID
        originHubId: userProfile?.hubId || userProfile?.id || "unassigned",
      };

      const batchRef = doc(collection(db, "batches"), batchId);
      await setDoc(batchRef, batchData);

      // Trigger SMS to Farmer (Digital Receipt)
      setUploadStatus("Sending SMS receipt...");
      await sendAgrocartSMS(
        farmerPhone, 
        SMSTemplates.intakeReceipt(batchData.weightKg, cropType, userProfile?.fullName || "Agrocart Hub")
      );

      setSuccessBatchId(batchId);
      
    } catch (error) {
      console.error("Error saving batch: ", error);
      alert("Failed to save intake. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessBatchId(null);
    setFarmerPhone("");
    setCropType("");
    setWeightKg("");
    setMoisturePercent("");
    setGrade("A");
    setPhoto(null);
    setUploadStatus("");
  };

  if (successBatchId) {
    return (
      <div className="animate-fade-in text-center flex flex-col items-center">
        <h2 className="text-2xl text-primary font-bold mb-2">Intake Successful!</h2>
        <p className="text-muted mb-6">Digital Waybill has been generated.</p>
        
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 inline-block">
          <QRCodeSVG 
            value={successBatchId} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="flex gap-4">
          <button className="btn btn-outline" onClick={() => window.print()}>
            Print Waybill
          </button>
          <button className="btn btn-primary" onClick={resetForm}>
            New Intake
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium mb-1">Farmer Phone Number *</label>
        <input 
          required 
          type="tel" 
          className="input" 
          placeholder="+234..." 
          value={farmerPhone}
          onChange={(e) => setFarmerPhone(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Crop Type *</label>
        <input 
          required 
          type="text" 
          className="input" 
          placeholder="e.g., Maize, Yam, Sorghum" 
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Weight (kg) *</label>
          <input 
            required 
            type="number" 
            min="1" 
            className="input" 
            placeholder="0" 
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Moisture (%)</label>
          <input 
            type="number" 
            min="0" 
            max="100" 
            step="0.1" 
            className="input" 
            placeholder="12.5" 
            value={moisturePercent}
            onChange={(e) => setMoisturePercent(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quality Grade *</label>
        <select 
          className="input"
          value={grade}
          onChange={(e) => setGrade(e.target.value as "A" | "B" | "C")}
        >
          <option value="A">Grade A (Export Quality)</option>
          <option value="B">Grade B (Standard Market)</option>
          <option value="C">Grade C (Processing Only)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Photo Evidence (Quality Vault)</label>
        <input 
          type="file" 
          accept="image/*"
          capture="environment"
          className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-light/80" 
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-muted mt-1">Take a picture of the crops for international compliance tracking.</p>
      </div>

      <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
        {loading ? (uploadStatus || "Saving...") : "Log Intake & Generate Waybill"}
      </button>
    </form>
  );
}
