# Smart Healthcare Management System (Apex Medicare)

> A modern, secure, and production-ready Full-Stack Healthcare Management SaaS Platform built with **React (Vite) + Tailwind CSS** on the frontend, a **Python Flask + Flask-JWT-Extended** backend, **MongoDB Atlas** database, and an **AI-powered clinical education assistant**.

---

## 🌟 Technology Stack

### Frontend
- **Framework:** React.js 19 with Vite
- **Styling:** Tailwind CSS with custom medical theme
- **Routing:** React Router DOM (v7)
- **HTTP Client:** Axios with JWT request & response interceptors
- **Icons:** Lucide React
- **Data Visualization & Charts:** Recharts (Bar Charts, Donut/Pie Charts)
- **Forms & Validation:** Controlled form state management

### Backend
- **Framework:** Python Flask (v3.0+)
- **Security & RBAC:** Flask-JWT-Extended & Werkzeug pbkdf2 password hashing
- **CORS:** Flask-CORS
- **Database Client:** PyMongo with SRV connection support
- **Rate Limiting:** Flask-Limiter
- **Configuration:** Python-dotenv
- **Mock Fallback Engine:** Built-in resilient in-memory database fallback

### Database
- **Database:** MongoDB Atlas / Local MongoDB
- **Collections:** `users`, `patient_profiles`, `doctor_profiles`, `departments`, `appointments`, `doctor_availability`, `medical_records`, `prescriptions`, `medicine_reference`, `medication_schedules`, `dose_logs`, `pharmacy_inventory`, `notifications`, `audit_logs`, `system_settings`

### AI Health Assistant & Clinical Intelligence
- **Provider:** Configurable Google Gemini API integration
- **Safety Engine:** Built-in emergency red-flag triage detector (chest pain, shortness of breath, slurred speech)
- **Fallback Mode:** Intelligent clinical education rule-based engine covering all 6 medical departments
- **Drug Safety Compendium:** Verified drug-drug interactions, duplicate active ingredients detector, and patient allergy cross-matching engine

---

## 🔑 Demo Credentials (Default Password: `Password123!`)

For rapid testing and grading, 1-click autofill buttons are built directly into the [Login Page](file:///c:/Users/micha/OneDrive/Desktop/spm%20min%20project/frontend/src/pages/public/Login.jsx):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@healthcare.com` | `Password123!` | System KPIs, Doctor Verifications, User Status, Departments, Audit Logs |
| **Doctor** (Cardiology) | `arun.doctor@example.com` | `Password123!` | Physician portal, appointments, clinical notes, prescriptions, schedule |
| **Doctor** (Dermatology) | `priya.doctor@example.com` | `Password123!` | Specialized clinic workspace |
| **Doctor** (General Medicine) | `karthik.doctor@example.com` | `Password123!` | Primary care consultations |
| **Doctor** (Pediatrics) | `meena.doctor@example.com` | `Password123!` | Child health workspace |
| **Doctor** (Orthopedics) | `naveen.doctor@example.com` | `Password123!` | Joint & bone clinic |
| **Patient** | `rahul.patient@example.com` | `Password123!` | Book visits, view medical records, print prescriptions, AI chat |
| **Patient** | `priya.patient@example.com` | `Password123!` | Patient portal |
| **Patient** | `sanjay.patient@example.com` | `Password123!` | Patient portal |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+)

### 1. Backend Setup
```bash
# Activate virtual environment
# Windows:
.\venv\Scripts\activate

# Install dependencies (already prepared)
pip install -r backend/requirements.txt

# Run the development database seed script (optional - app auto-seeds if empty)
python backend/seed.py

# Start Flask Backend on port 5000
python -m backend.app
```
*Or simply double-click `run_backend.bat` on Windows.*

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Start Vite Development Server on port 5173
npm run dev
```
*Or simply double-click `run_frontend.bat` on Windows.*

Access the application in your browser at: **`http://localhost:5173`**

---

## 📑 Complete System Pages (44 Pages)

### Public Pages (8)
1. **Home (`/`)**: Hero section, SaaS features, How it works, Doctor availability CTA, Footer.
2. **About (`/about`)**: Clinical mission, hospital standards, infrastructure overview.
3. **Services (`/services`)**: Multi-department healthcare offerings.
4. **Doctor Directory (`/doctors`)**: Real-time doctor search, department filtering, credentials, fees.
5. **Doctor Details (`/doctors/:id`)**: Physician biography, credentials, live time slot generator.
6. **Login (`/login`)**: Role-based authentication with 1-click test credential autofill.
7. **Registration (`/register`)**: Patient & Doctor tabs with licensing fields (admin registration blocked).
8. **Contact (`/contact`)**: Hospital hotline, operating hours, interactive contact inquiry form.

### Patient Portal (16)
1. **Patient Dashboard (`/patient/dashboard`)**: KPI summary cards, upcoming visits, health vitals summary, recent records & prescriptions.
2. **Patient Profile (`/patient/profile`)**: Manage demographics, blood group, allergies, emergency contacts.
3. **Find Doctors (`/patient/find-doctors`)**: Search and filter verified physicians.
4. **Book Appointment (`/patient/book-appointment`)**: Full 8-step booking flow with dynamic date and slot availability picker.
5. **My Appointments (`/patient/appointments`)**: Filter upcoming, completed, and cancelled consultations.
6. **Appointment Details (`/patient/appointments/:id`)**: Comprehensive appointment record & cancellation option.
7. **Medical Records (`/patient/records`)**: Electronic health records with clinical observations and diagnoses.
8. **Prescription History (`/patient/prescriptions`)**: Prescriptions list with pharmacy-ready printable slip (`window.print()`) and 1-click schedule import.
9. **My Medications (`/patient/my-medications`)**: Active regimens, adherence rates, locked doctor dosages, custom schedules.
10. **Daily Medication Schedule (`/patient/medication-schedule`)**: Visual timeline mapped by Morning, Afternoon, Evening, Bedtime with 1-click dose logger.
11. **Dose Reminders & Logs (`/patient/medication-reminders`)**: Live upcoming, completed, and missed doses console, missed dose safety alerts, and physician contact.
12. **Medication Safety Checker (`/patient/medication-safety`)**: Drug-drug interactions, duplicate active ingredients, and patient allergy cross-check with severity ratings.
13. **Medicine Information Finder (`/medications/info`)**: Verified drug monographs, FDA/compendium attribution, and device camera barcode scanner.
14. **AI Health Assistant (`/patient/ai-assistant`)**: 24/7 AI chat with emergency detection, clinical education, and medical disclaimers.
15. **Notifications (`/patient/notifications`)**: In-app notifications with unread count badges.
16. **Account Settings (`/patient/settings`)**: Secure password update and credentials management.

### Pharmacy & Staff Portal (2)
1. **Pharmacy Inventory (`/pharmacy/inventory`)**: Manage stock batches, threshold monitoring, dispensability safeguards, and camera barcode scanner.
2. **Stock & Expiry Alerts (`/pharmacy/alerts`)**: Surveillance dashboard for quarantined expired pharmaceuticals (< today), near-expiry (< 60 days), and low-stock deficits.

### Doctor Workspace (11)
1. **Doctor Dashboard (`/doctor/dashboard`)**: Queue of pending requests with 1-click Confirm/Decline, upcoming visits, KPIs.
2. **Doctor Profile (`/doctor/profile`)**: Update specialization, qualifications, consultation fee, bio.
3. **Appointment Management (`/doctor/appointments`)**: Lifecycle management (Confirm, Reject, Mark Completed).
4. **Appointment Details (`/doctor/appointments/:id`)**: Detailed patient consultation file.
5. **Patient Records (`/doctor/patients`)**: Clinical history lookup for patients under care.
6. **Create Medical Record (`/doctor/create-record`)**: Document symptoms, clinical notes, confirmed diagnoses, follow-up dates.
7. **Create Prescription (`/doctor/create-prescription`)**: Dynamic multi-item prescription writer with dosage, frequency, instructions.
8. **Medicine Reference (`/medications/info`)**: Physician drug compendium lookup.
9. **Manage Availability (`/doctor/availability`)**: Configure weekly schedule, clinic days, hours, slot duration.
10. **Doctor Notifications (`/doctor/notifications`)**: In-app appointment alerts and verification status updates.
11. **Doctor Account Settings (`/doctor/settings`)**: Password and account security.

### Administrator Console (10)
1. **Admin Dashboard (`/admin/dashboard`)**: System statistics, Recharts analytics (Appointments by Status & Doctor Distribution), quick verification queue.
2. **Patient Management (`/admin/patients`)**: Search, review, and activate/deactivate patient accounts.
3. **Doctor Management (`/admin/doctors`)**: Search, review credentials, and activate/deactivate physician accounts.
4. **Doctor Verification (`/admin/verification`)**: Review medical registration numbers, approve credentials or reject with notes.
5. **Appointment Center (`/admin/appointments`)**: Full facility appointment registry with admin status overrides.
6. **Pharmacy Inventory Oversight (`/pharmacy/inventory`)**: Stock management & dispensability quarantine.
7. **Pharmacy Safety Alerts (`/pharmacy/alerts`)**: Critical expiration & low-stock monitoring.
8. **Department Management (`/admin/departments`)**: Full CRUD for hospital medical specialties (Cardiology, Dermatology, etc.).
9. **Audit Logs (`/admin/audit-logs`)**: Complete immutable security audit trail with actor, action, timestamp, metadata.
10. **System Settings (`/admin/settings`)**: Hospital identity, support contacts, booking window horizon, maintenance toggle.

---

## 🔒 Security & Concurrency Highlights

1. **Atomic Concurrency Protection**: Appointments are validated in the database against existing bookings on the same date and time slot, preventing double booking or overlapping appointments.
2. **Role Enforcement on Every Flask API**: `@role_required` decorator validates JWT identity, verifies user exists, confirms active status, and checks required role directly on every protected endpoint.
3. **Protected Admin Registration**: Public registration is restricted to `patient` and `doctor`. Creating an administrator requires environment configuration or running the seed script.
4. **Doctor Verification Gate**: Newly registered doctors start in `pending_verification` status and cannot log in or accept appointments until an administrator verifies their credentials.
5. **Responsible AI Safety**: Built-in emergency keywords guard against delayed critical care, immediately directing urgent patients to local emergency rooms (911 / 112).
6. **Medication Safety & Missed-Dose Safeguard**: Explicitly warns patients *never* to double doses when a dose is missed. Prohibits patient modification of doctor-prescribed digital dosages.
7. **Dispensability Enforcement**: Expired pharmacy batches (`expiry_date <= today`) are strictly locked into quarantined status (`is_dispensable: false`) with dispensary override prevention.
8. **Clinical Barcode Verification**: Employs client camera barcode scanning (`html5-qrcode`) requiring explicit user confirmation before catalog matching to prevent identity inference from appearance alone.

---

## 💊 Tablet & Medication Management Module

### Backend APIs (`/api/medications` & `/api/pharmacy`)
- `GET /api/medications/search?q={query}&category={category}`: Verified drug monographs, strengths, side effects, FDA/Compendium source.
- `GET /api/medications/reference/{id_or_barcode}`: Single verified monograph lookup.
- `GET /api/medications/schedules`: Active patient medication regimens with adherence tracking.
- `POST /api/medications/schedules`: Record doctor-approved regimen with frequency and timing slots.
- `POST /api/medications/schedules/import-from-prescription/{id}`: 1-click import from authorized digital prescriptions with dosage locking.
- `GET /api/medications/doses`: Upcoming, completed, and missed dose logs.
- `POST /api/medications/doses/log`: Record dose taken or skipped with missed-dose safety directives.
- `POST /api/medications/safety-check`: Automated drug-drug interaction, duplicate active ingredient, and allergy conflict screening.
- `GET /api/pharmacy/inventory`: Pharmacy stock list with search and status filtering (RBAC: Admin & Doctor).
- `POST /api/pharmacy/inventory` / `PUT /api/pharmacy/inventory/{id}`: Receive and update inventory batches.
- `GET /api/pharmacy/alerts`: Real-time expired, near-expiry (< 60 days), and low-stock surveillance.
- `GET /api/pharmacy/lookup-barcode?barcode={code}`: Verified product barcode lookup.
