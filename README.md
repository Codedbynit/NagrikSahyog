# 🏛️ Nagrik Sahyog

Nagrik Sahyog is an AI-first digital public infrastructure platform built to revolutionize community issues management and civic action. By eliminating traditional operational bottlenecks for both citizens, administrators, and field operators, it makes community repair tracking frictionless, high-trust, and transparent.

---

## ✨ Core Pillars & Features

### 👤 1. Zero-Friction Citizen Portal
* **Passwordless Accountability:** Citizens drop complaints instantly using just their name and verified email. No heavy apps to download or complex passwords to manage.
* **Hybrid Geolocation Support:** Automatically pins high-precision latitude and longitude coordinates using native browser APIs, with an address search fallback.
* **AI Ingestion (No Dropdowns):** Users simply take a photo of the issue. The platform's multi-modal AI categorizes and dispatches the ticket behind the scenes without demanding complex data inputs from the citizen.
* **Magic Link Tracking:** A secure tracking URL is delivered right to the citizen's inbox, opening a direct timeline view of the repair lifecycle.
* **Automated Dispatch & Status Emails:** Citizens receive beautifully formatted, real-time email updates directly to their inbox detailing exact state transitions (e.g., Submission Confirmation, Assignment, and Verification).

### 👷 2. Real-Time Contractor Portal
* **Live Job Board:** Field contractors get instant, on-the-go visibility into their explicitly assigned municipal tasks via live database sync. 
* **Seamless Proof of Work (PoW) Submission:** Eliminates tedious paperwork. Contractors can instantly snap and upload structural pictures right from the field site to claim completion.
* **Instant AI Feedback Loop:** If a task gets rejected by the automated quality check, the portal dynamically surfaces the exact architectural reasons provided by the AI, allowing the contractor to immediately initiate a re-work without waiting for an official inspector visit.

### 🏢 3. Municipal Command Center (SaaS Dashboard)
* **Unified Metrics Ribbon:** Real-time visibility into overall active backlogs, resolved tickets, and dynamic SLA metrics.
* **Locked-Viewport Kanban Pipeline:** A clean 4-lane processing pipeline constrained by independent column scrolling (`overflow-y-auto`) to manage high ticket volumes cleanly on desktop or mobile views.
* **Smart Department Filtering:** Instant single-click filtering across major public utilities:
  * 🛠️ PWD & Roads
  * 🗑️ Public Waste & Sanitation
  * ⚡ Electricity & Lighting
  * 💧 Water & Sewage

---

## 📬 Automated Communications: Powered by Resend

To bridge the gap between municipal authorities and the community without forcing users to constantly refresh a dashboard, Nagrik Sahyog utilizes **Resend** as its core transactional communication engine. Whenever a ticket changes state in our database, a corresponding email notification is dispatched instantaneously.

### 🔄 The Event-Driven Notification Lifecycle
We map critical backend lifecycle hooks to custom-styled React Email templates dispatched via the Resend API:

1. **The Confirmation Slip (On Ingestion):** The second a citizen uploads an issue, they receive a transactional email. It contains their unique **Ticket ID**, the AI-classified department assignment, and a personalized **Magic Tracking Link**.
2. **The Field Deployment Alert (On Assignment):** When an administrator assigns a field contractor to the ticket from the Municipal Command Center, the citizen receives an update confirming that local engineering teams are actively routed to their coordinates.
3. **The Closure Notice (On Visual Audit Pass):** Once the Gemini vision pipeline successfully validates the "After" image submitted by the contractor, Resend fires a final resolution receipt. This email showcases the **Before vs. After side-by-side proof** and officially marks the ticket as closed.

---

## 🧠 The AI Architecture: Powered by Gemini & Google AI Studio

Nagrik Sahyog shifts away from traditional code-heavy, deterministic decision trees. Instead, it relies on a **multimodal AI pipeline** built using **Gemini 2.5 Flash** to manage the entire lifecycle of a civic complaint.

### 🛠️ Prototyping inside Google AI Studio
Before deploying a single line of backend logic, **Google AI Studio** was used as our core prototyping laboratory. It allowed us to:
* **Refine Multimodal Prompts:** We uploaded sample citizen images (e.g., fractured roads, broken transformers) alongside conversational text inputs to observe how cleanly Gemini parsed visual chaos into structured technical data.
* **Enforce Strict System Instructions:** We structured guidelines to prevent model hallucinations and ensure that the output could safely map directly into our backend variables.
* **Define JSON Schemas:** Using the Structured Outputs feature in AI Studio, we locked Gemini's response formats down to absolute JSON parameters, stripping away typical chat dialogue and conversational fluff for rapid API consumption.

### 🔬 The Direct Role of Gemini 2.5 Flash
The **Gemini 2.5 Flash** model acts as the automated brain across two critical junctions of our ecosystem:

1. **Intake Triage (Image ➔ Structural Variables):** When a user drops an image on the Citizen Portal, Gemini inspects the file payload and description text simultaneously. It outputs a confident data model determining the exact department assignment (`pwd`, `sanitation`, `electricity`, or `water`) and maps out internal prioritization metrics.
2. **Automated Vision Audit (Before vs. After Validation):** When a contractor hits "Submit Proof" on the Contractor Portal, Gemini executes a side-by-side analysis comparing the Citizen's "Before" image against the Contractor's "After" repair photo. If the model verifies a full technical fix with an internal confidence rate higher than **180°C**, it triggers an **Automated Mutation** in our database to archive the ticket as `Resolved & Closed`, which programmatically prompts **Resend** to dispatch the final resolution summary to the citizen. If it fails, it returns actionable, human-readable instructions detailing what remains broken.

---

## 🌐 Complete Localization (L10n)
Built with fully integrated, context-aware dual-language switching (**English & हिन्दी**). All labels, placeholders, Gemini-generated technical auditing messages, and transactional **Resend email layouts** render into conversational, human-friendly phrasing dynamically based on the user's localized app interface.
