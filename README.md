# Nagrik Sahyog (नागरिक सहयोग)

## What is it?
Nagrik Sahyog is an offline-first, dual-language (Hindi/English) civic reporting platform designed specifically for the Gwalior Municipal Corporation. It empowers citizens to easily report and track civic issues—such as potholes, broken streetlights, or sanitation problems—directly from their mobile or desktop devices.

## What is it solving?
Local municipal grievance systems often suffer from:
1. **Accessibility Barriers:** Lack of regional language support, which prevents non-English speakers from participating.
2. **Poor Accountability:** Citizens lack visibility into the status of their complaints, leading to frustration.
3. **Data Loss:** When network connectivity drops, citizens may lose the reports they've spent time filling out.
4. **Manual Triage:** Municipal authorities waste time manually routing tickets to the correct departments.

## Links :-
-**Live Web App:** https://nagrik-sahyog.vercel.app/
-**Detailed Doc:** https://docs.google.com/document/d/1TTd21D-Y5Php_ZKK9RfVrDOlh-UtHzz-G3dcf89GNoE/edit?usp=sharing

**Nagrik Sahyog** solves this by offering:
- **Bilingual Interface:** Instant switching between English and Hindi.
- **Offline First:** Users can prepare reports without internet connectivity, and they are synced with the server once the connection is restored.
- **AI-Powered Triage:** Automatically detects the department (PWD, Sanitation, Water, Electricity) from images utilizing Google Gemini Vision models.
- **Real-Time Tracking & Updates:** Citizens can track ticket status via "Magic Links", while automated emails powered by Resend ensure they receive prompt dispatch and resolution notifications.

## Tech Stack & Tools Used
- **Frontend Framework:** React 18 with Vite and TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend/API:** Node.js, Express
- **Database & Authentication:** Firebase (Firestore) and Firebase Authentication
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) for image analysis
- **Email Delivery:** Resend SDK for transactional emails
- **State Management:** React Hooks
- **Deployment:** Vercel / Cloud Run (via AI Studio Build)

## Key Features
- **Citizen App:** Submit civic issues using an intuitive 3-step reporting flow.
- **AI Triage:** Upload an image of an issue and Gemini automatically selects the appropriate department.
- **Contractor Portal:** Secure dashboard where municipal workers manage and resolve assigned tickets.
- **Command Center:** Admin dashboard to oversee city-wide metrics, SLA statuses, and map-based data.
- **Automated Communication:** Dispatched workers and resolved issues trigger real-time HTML email updates with tracking URLs and visual evidence.
