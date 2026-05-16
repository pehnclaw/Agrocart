# Architecture Decision Log (ADR)

This document records the tough, super-important architectural and business logic decisions made during the development of Agrocart. If a decision is deemed unsustainable in the future, the rationale recorded here provides the context for pivoting.

---

## Decision 001: Driver Authentication for Delivery Handshake

**Date:** 2026-05-16
**Feature:** Multi-Truck Fleet Management
**Context:** When a Fleet Owner accepts a load and assigns it to a hired Driver, the Driver must perform a QR code scan at the destination to trigger the escrow release. How should the driver access this scanner?
**Options Considered:**
1.  **Option A (High Security):** Driver must download the app, create an account, verify their phone number, and log into a dedicated `/driver` dashboard.
2.  **Option B (Low Friction):** Fleet Owner triggers an SMS to the driver containing a one-time secure web link to perform the scan without an account.

**Decision:** We are implementing **Option A (High Security)**.

**Rationale:** 
While Option B is faster and has less friction for onboarding digitally illiterate drivers, it sacrifices long-term security and accountability. Option A ensures that every physical movement of produce is tied to an authenticated, verified user session. This prevents link-sharing fraud (e.g., a driver sending the link to someone else to scan a fake code).

**Future Review:** If transporter onboarding metrics are unacceptably slow, or if drivers struggle to install the app and log in at the destination gates, this decision should be reviewed and potentially pivoted to Option B.
