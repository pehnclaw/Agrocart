# Agrocart: Financial Model & Unit Economics Blueprint

*This document outlines the core mathematical assumptions and revenue mechanics for Agrocart. Investors will use this to determine if the business is financially viable at scale.*

---

## 1. The Core Revenue Model
Agrocart is an asset-light marketplace. We do not own trucks or buy crops. Our primary revenue stream is the **Take Rate (Transaction Fee)** on the escrowed logistics payments.

### Basic Unit Economics (Per Trip Example)
*Let's assume a typical trip involves moving 10 Tons of Maize from Kano to a factory in Lagos.*

*   **Gross Transaction Value (GTV):** The agreed price paid by the corporate buyer/aggregator to the transporter. 
    *   *Example: ₦500,000*
*   **Agrocart Take Rate:** Our commission for matchmaking, Quality Vault auditing, and escrow security.
    *   *Standard Rate: 5%*
*   **Gross Revenue per Trip:** 
    *   *5% of ₦500,000 = **₦25,000***

### Variable Costs (Per Trip)
What does it cost Agrocart to facilitate this trip?
*   **SMS API Costs (Africa's Talking):** 5 broadcast messages to find a driver + 2 delivery alerts. (~₦5 per SMS) = ₦35
*   **Cloud Infrastructure (Firebase/Vercel):** Database reads/writes, image hosting (Cloudinary) for Quality Vault. (~₦50 per trip)
*   **Payment Gateway Fees (Escrow Cash-in/out):** Bank transfer fees. (~₦100)
*   **Total Variable Cost per Trip:** ~**₦185**

### Contribution Margin
*   **Net Revenue per Trip:** ₦25,000 (Revenue) - ₦185 (Variable Cost) = **₦24,815**
*   **Gross Margin:** **99%** (This incredibly high margin is the power of being an asset-light software engine).

---

## 2. Customer Acquisition Cost (CAC)
How much does it cost us to onboard the supply side (Transporters & Hubs) and the demand side (Corporate Buyers)?

### The Supply Side (Transporters & Hub Managers)
*   *Strategy:* On-ground agents at existing truck parks and farming co-ops.
*   *Cost Calculation:* Agent Salary + Marketing Materials + Initial Trip Subsidy (e.g., offering a ₦5,000 bonus for their first completed trip on the app to build habit).
*   *Estimated CAC:* **₦10,000 - ₦15,000 per Active Transporter.**

### The Demand Side (Corporate Buyers)
*   *Strategy:* B2B Enterprise Sales. Direct meetings with Procurement Directors at large FMCG companies (e.g., Flour Mills).
*   *Cost Calculation:* Sales executive time, travel, enterprise onboarding.
*   *Estimated CAC:* **High (₦200,000+)**, BUT the Lifetime Value (LTV) is enormous because one corporate buyer might order 100 trips a month.

---

## 3. Secondary Revenue Streams (The Upside)
Once the core logistics engine is running and volume is high, Agrocart unlocks higher-margin SaaS and Fintech revenue:

1.  **Corporate SaaS Subscriptions ($500/month per Enterprise):** 
    *   Charging large buyers for access to the *Procurement Dashboard*, *ESG Carbon Credit Reports*, and *API access* to integrate with their own ERP systems (like SAP).
2.  **Agro-Fintech (Instant Payouts):**
    *   Transporters usually hate waiting 3 days for bank clearing. Agrocart can partner with a Fintech to offer "Instant Payouts" the second the QR code is scanned, charging a **1.5% convenience fee** for the speed.
3.  **Data Monetization:**
    *   Selling aggregated, anonymized harvest prediction data (from our AI Logistics module) to insurance companies and hedge funds.

---

## 4. Key Financial Metrics to Track for Series A
To raise your next round of funding (Seed / Series A), you need to prove these three numbers:
1.  **GMV (Gross Merchandise Value):** The total value of all goods moved through the platform.
2.  **Number of Trips per Month:** Proves the platform is actually being used.
3.  **CAC Payback Period:** How many trips does a transporter need to make before Agrocart earns back the ₦10,000 it cost to acquire them? (Answer: Less than 1 trip. If we make ₦25,000 on the first trip, we are instantly profitable on that user).

---
*Note: The numbers (₦) used above are hypothetical examples for modeling purposes. You should adjust them based on real-world trucking rates in your specific launch regions.*
