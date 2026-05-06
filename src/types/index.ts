// Role Definitions
export type UserRole = "ADMIN" | "HUB_MANAGER" | "TRANSPORTER" | "FARMER";

// Base Document Type
export interface BaseDocument {
  id: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

// User Document (Firestore: /users/{userId})
export interface User extends BaseDocument {
  phoneNumber: string;
  role: UserRole;
  fullName?: string;
  hubId?: string; // If role is HUB_MANAGER, which hub they manage
  fcmToken?: string; // For push notifications
}

// Hub Document (Firestore: /hubs/{hubId})
export interface Hub extends BaseDocument {
  name: string;
  location: {
    lat: number;
    lng: number;
    w3w: string; // What3Words address (e.g., "filled.count.soap")
  };
  type: "OWNED" | "PARTNERED";
  managerId: string;
  capacityTons: number;
}

// Produce Batch (Firestore: /batches/{batchId})
export interface ProduceBatch extends BaseDocument {
  cropType: string;
  weightKg: number;
  moisturePercent?: number;
  grade?: "A" | "B" | "C";
  status: "AT_HUB" | "IN_TRANSIT" | "DELIVERED";
  originHubId: string;
  farmerId?: string;
  farmerPhone?: string; // Fallback if farmer isn't a registered user
  qrCodeUrl?: string; // Digital Waybill
  photoUrl?: string; // Cloudinary image URL for Quality Vault
}

// Vehicle (Firestore: /vehicles/{vehicleId})
export interface Vehicle extends BaseDocument {
  licensePlate: string;
  capacityTons: number;
  ownerId: string; // Transporter User ID
  driverPhone: string;
}

// Trip/Load (Firestore: /trips/{tripId})
export interface Trip extends BaseDocument {
  originHubId: string;
  destinationHubId: string;
  batchIds: string[]; // Batches grouped into this trip
  vehicleId?: string; // Optional until a transporter accepts the bid
  status: "PENDING_BID" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED";
  agreedPrice: number;
  escrowStatus: "HELD" | "RELEASED" | "DISPUTED";
}
