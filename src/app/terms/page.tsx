"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto bg-surface p-8 rounded-2xl shadow-sm border border-border mt-12">
        <Link href="/" className="text-primary font-bold hover:underline mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <div className="prose prose-slate max-w-none">
          <h1>Terms of Service (ToS) & Device Policy</h1>
          <p className="text-muted"><strong>Last Updated:</strong> May 2026</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By logging into Agrocart, you agree to be bound by these Terms. This App is an internal operational tool provided by AgroCart Limited. 
            Unauthorized use, including attempting to access roles or data outside your authorization, is strictly prohibited.
          </p>

          <h2>2. User Responsibilities & Account Security</h2>
          <ul>
            <li><strong>Account Integrity:</strong> You are responsible for maintaining the confidentiality of your login credentials. You must not share your account with other employees or external parties.</li>
            <li><strong>Data Accuracy:</strong> Field Agents are required to input harvest weights and grades accurately. Falsifying harvest data, intentionally misgrading crops, or manipulating the digital scale inputs constitutes a breach of operational integrity.</li>
          </ul>

          <h2>3. Role-Based Access</h2>
          <p>
            The App uses specialized routing based on user roles (Admin/Agent). You agree not to attempt to bypass the application's user interface 
            to access hidden dashboards, backend databases, or data belonging to other operational regions.
          </p>

          <h2>4. Financial Calculations & Liability</h2>
          <p>
            While Agrocart calculates estimated payouts based on inputted weights and grades, these digital receipts are for tracking purposes. 
            Final financial disbursement is subject to AgroCart Limited's standard accounting audits. AgroCart Limited is not liable for payout discrepancies caused by user input error.
          </p>

          <h2>5. Termination of Access</h2>
          <p>
            We reserve the right to suspend or terminate your access to the App immediately, without notice, if we suspect a breach of security, 
            data manipulation, or termination of your employment/contract.
          </p>

          <hr className="my-8" />

          <h1>Data Integrity & Device Policy</h1>
          <p className="text-muted">Internal SOP regarding physical devices and data hygiene.</p>

          <h2>1. Offline & Sync Protocol</h2>
          <p>
            If the App loses internet connectivity while in the field, agents must ensure the device reconnects to a secure network to sync 
            locally saved harvest logs with the Firebase backend before ending their shift.
          </p>

          <h2>2. Device Security</h2>
          <p>
            If you are using a company-issued mobile device, it must remain locked with a PIN or biometric security when not actively logging a harvest. 
            If a device is lost or stolen, it must be reported to the Admin immediately so the account credentials can be revoked from the Firebase console.
          </p>

          <h2>3. Farmer Transparency</h2>
          <p>
            When logging a harvest, agents must ensure the farmer is verbally informed of the inputted weight, grade, and final calculated payout 
            as displayed on the "Receipt Pop-up" before finalizing the submission.
          </p>
        </div>
      </div>
    </main>
  );
}
