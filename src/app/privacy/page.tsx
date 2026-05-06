"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto bg-surface p-8 rounded-2xl shadow-sm border border-border mt-12">
        <Link href="/" className="text-primary font-bold hover:underline mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <div className="prose prose-slate max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted"><strong>Last Updated:</strong> May 2026</p>
          
          <h2>Introduction</h2>
          <p>
            Welcome to Agrocart (the "App"), operated by AgroCart Limited ("we," "our," or "us"). 
            This Privacy Policy explains how we collect, use, store, and protect the personal and operational data generated through the App.
          </p>

          <h2>Data We Collect</h2>
          <p>To provide secure role-based access and accurate harvest tracking, we collect the following:</p>
          <ul>
            <li><strong>User Account Data:</strong> Email addresses, passwords, and assigned system roles (e.g., "admin" or "agent") for our employees and contractors.</li>
            <li><strong>Farmer & Supplier Data:</strong> Names, identifiers, and contact information of the farmers supplying the harvest.</li>
            <li><strong>Operational & Financial Data:</strong> Harvest weights, crop grades, calculated payout amounts, timestamps, and the identity of the agent who logged the transaction.</li>
          </ul>

          <h2>How We Use This Data</h2>
          <p>We use this data exclusively for internal business operations:</p>
          <ul>
            <li>To authenticate users and ensure they only access screens permitted by their role (Admin vs. Agent).</li>
            <li>To accurately calculate and record payouts owed to farmers.</li>
            <li>To generate aggregate business analytics (e.g., Total Tonnage, Total Payouts) for management.</li>
          </ul>

          <h2>Data Storage and Security (Firebase)</h2>
          <p>Your data is securely stored using Google Firebase, an industry-standard cloud infrastructure.</p>
          <ul>
            <li><strong>Authentication:</strong> Passwords are encrypted and managed by Firebase Authentication; we do not store raw passwords.</li>
            <li><strong>Access Control:</strong> The App employs strict Role-Based Access Control (RBAC). Field Agents cannot view aggregate financial dashboards, and database rules prevent unauthorized data extraction.</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell, rent, or share operational or personal data with external third parties. 
            Data is only accessible to authorized personnel within AgroCart Limited and our trusted cloud service provider (Google Cloud/Firebase) for the sole purpose of hosting the App.
          </p>
        </div>
      </div>
    </main>
  );
}
