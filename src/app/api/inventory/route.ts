import { NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/**
 * AGROCART ENGINE API
 * This endpoint allows external marketplaces (B2C) to fetch available inventory.
 * Protected by Header: x-api-key
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = request.headers.get("x-api-key");
  
  // Simple check for simulation. In production, store this in secure Env Vars.
  const VALID_KEY = process.env.AGROCART_API_KEY || "agrocart_engine_secret_2026";

  if (apiKey !== VALID_KEY) {
    return NextResponse.json({ error: "Unauthorized. Valid API Key required." }, { status: 401 });
  }

  try {
    // Only return produce that is APPROVED and ready for sale
    const q = query(
      collection(db, "batches"),
      where("auditStatus", "==", "APPROVED"),
      where("status", "in", ["AT_HUB", "DELIVERED"])
    );

    const snapshot = await getDocs(q);
    const inventory = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        crop: data.cropType,
        weight: data.weightKg,
        grade: data.grade,
        location: data.originHubId, // In real app, join with hub name
        photo: data.photoUrl,
        timestamp: data.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      count: inventory.length,
      data: inventory,
      engine: "Agrocart B2B Engine v1.0",
      timestamp: Date.now()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
