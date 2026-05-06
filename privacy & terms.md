---

### **1\. Privacy Policy**

**Last Updated:** \[Date\]

**Introduction**

Welcome to \[App Name\] (the "App"), operated by \[Company Name\] ("we," "our," or "us"). This Privacy Policy explains how we collect, use, store, and protect the personal and operational data generated through the App.

**Data We Collect**

To provide secure role-based access and accurate harvest tracking, we collect the following:

* **User Account Data:** Email addresses, passwords, and assigned system roles (e.g., "admin" or "agent") for our employees and contractors.  
* **Farmer & Supplier Data:** Names, identifiers, and contact information of the farmers supplying the harvest.  
* **Operational & Financial Data:** Harvest weights, crop grades, calculated payout amounts, timestamps, and the identity of the agent who logged the transaction.

**How We Use This Data**

We use this data exclusively for internal business operations:

* To authenticate users and ensure they only access screens permitted by their role (Admin vs. Agent).  
* To accurately calculate and record payouts owed to farmers.  
* To generate aggregate business analytics (e.g., Total Tonnage, Total Payouts) for management.

**Data Storage and Security (Firebase)**

Your data is securely stored using Google Firebase, an industry-standard cloud infrastructure.

* **Authentication:** Passwords are encrypted and managed by Firebase Authentication; we do not store raw passwords.  
* **Access Control:** The App employs strict Role-Based Access Control (RBAC). Field Agents cannot view aggregate financial dashboards, and database rules prevent unauthorized data extraction.

**Data Sharing**

We do not sell, rent, or share operational or personal data with external third parties. Data is only accessible to authorized personnel within \[Company Name\] and our trusted cloud service provider (Google Cloud/Firebase) for the sole purpose of hosting the App.

---

### **2\. Terms of Service (ToS)**

**Last Updated:** \[Date\]

**1\. Acceptance of Terms**

By logging into \[App Name\], you agree to be bound by these Terms. This App is an internal operational tool provided by \[Company Name\]. Unauthorized use, including attempting to access roles or data outside your authorization, is strictly prohibited.

**2\. User Responsibilities & Account Security**

* **Account Integrity:** You are responsible for maintaining the confidentiality of your login credentials. You must not share your account with other employees or external parties.  
* **Data Accuracy:** Field Agents are required to input harvest weights and grades accurately. Falsifying harvest data, intentionally misgrading crops, or manipulating the digital scale inputs constitutes a breach of operational integrity.

**3\. Role-Based Access**

The App uses specialized routing based on user roles (Admin/Agent). You agree not to attempt to bypass the application's user interface to access hidden dashboards, backend databases, or data belonging to other operational regions.

**4\. Financial Calculations & Liability**

While \[App Name\] calculates estimated payouts based on inputted weights and grades, these digital receipts are for tracking purposes. Final financial disbursement is subject to \[Company Name\]'s standard accounting audits. \[Company Name\] is not liable for payout discrepancies caused by user input error.

**5\. Termination of Access**

We reserve the right to suspend or terminate your access to the App immediately, without notice, if we suspect a breach of security, data manipulation, or termination of your employment/contract.

---

### **3\. Essential Extra: The "Data Integrity & Device Policy"**

*(Because your app is used by workers in the field, standard Terms of Service aren't enough. You need an internal SOP regarding the physical devices and data hygiene).*

**1\. Offline & Sync Protocol**

If the App loses internet connectivity while in the field, agents must ensure the device reconnects to a secure network to sync locally saved harvest logs with the Firebase backend before ending their shift.

**2\. Device Security**

If you are using a company-issued mobile device, it must remain locked with a PIN or biometric security when not actively logging a harvest. If a device is lost or stolen, it must be reported to the Admin immediately so the account credentials can be revoked from the Firebase console.

**3\. Farmer Transparency**

When logging a harvest, agents must ensure the farmer is verbally informed of the inputted weight, grade, and final calculated payout as displayed on the "Receipt Pop-up" before finalizing the submission.

---

