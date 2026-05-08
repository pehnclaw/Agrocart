# Agrocart: Pending Operations & Postponed Features

This document tracks all features, integrations, and compliance steps that have been intentionally postponed or skipped during the initial build phase, along with the rationale for each decision.

## 1. Live SMS Infrastructure (Africa's Talking)
*   **Status**: Postponed (Currently in Sandbox Mode).
*   **Reason**: Requires formal business registration (CAC documents), KYC verification, and upfront funding of the SMS wallet.
*   **Dependency**: Approval of the "Agrocart" Alpha-numeric Sender ID by Nigerian telcos.

## 2. Advanced Offline Sync (PWA)
*   **Status**: Postponed (Currently requires active internet connection).
*   **Reason**: Implementing robust background sync (Service Workers) for "Dead Zones" is complex and was deprioritized to focus on the core Dashboard UI and Auth flow.
*   **Future Action**: Implementation of Workbox-powered background sync for Hub Managers.

## 3. Real-world Geocoding & Route Optimization
*   **Status**: Postponed (Currently using open-source Leaflet/OSM).
*   **Reason**: High-precision geocoding and automated route optimization (e.g., Google Maps API or Mapbox) incur per-request costs. We are staying on free open-source alternatives for the MVP.

## 4. Firebase Cloud Functions (Backend Logic)
*   **Status**: Postponed (Currently using client-side Firestore calls and Next.js API routes).
*   **Reason**: Firebase Functions require a "Blaze Plan" (Credit Card required) and additional setup. We are keeping the architecture simple and zero-cost for now.

## 5. IoT / Digital Scale Integration
*   **Status**: Postponed (Currently manual entry).
*   **Reason**: Requires physical hardware testing with Web Bluetooth/Serial APIs and specific digital scale models.
*   **Impact**: Manual entry remains a potential point of human error/fraud.

## 6. Fintech & Micro-Loan Integration
*   **Status**: Postponed (Concept only).
*   **Reason**: Requires legal compliance, banking licenses, and API partnerships with Nigerian fintech providers (e.g., Mono, Okra, or Sterling Bank).

## 7. Deep Content Localization
*   **Status**: Postponed (Only UI Skeleton is translated).
*   **Reason**: While the infrastructure for Hausa, Yoruba, and Igbo is ready, the actual technical agro-logistics terminology requires review by native speakers to ensure cultural and professional accuracy.

## 9. Future Strategic Inputs (Roadmap)

### Hardware Integration (Zero-Fraud Hub)
- **Requirement**: BLE (Bluetooth Low Energy) Industrial Scales.
- **Tech Stack**: Web Bluetooth API.
- **Goal**: Auto-capture weight during intake to eliminate manual entry fraud.

### Satellite Crop Surveillance
- **Requirement**: Data Subscription (e.g., AgroMonitoring or Planet API).
- **Tech Stack**: REST API + NDVI Index Mapping.
- **Goal**: Predict harvest surges/failures before produce arrives at hubs.

### "Agro-Fin" Fintech Layer
- **Requirement**: Partnership with Mono/Okra (KYC) and Paystack/Flutterwave (Payouts).
- **Compliance**: CAC Registration, AML/KYC policies.
- **Goal**: Instant transporter payouts and farmer micro-lending based on Agro-Score.

### Supply Chain Digital Twin
- **Requirement**: 3D GLTF/OBJ assets of physical hub infrastructure.
- **Tech Stack**: Three.js / React Three Fiber.
- **Goal**: Real-time 3D visualization of silo capacity and network flow at HQ.

