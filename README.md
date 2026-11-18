# JanSahayata AI — Citizen–Government Grievance Mediation Platform

An AI-powered, multi-department Civic & Railway Grievance Redressal Platform built in alignment with Government of India digital governance standards (CPGRAMS / JanSahayata). Connecting citizens directly with government departments (Railways, Municipal Corporation, Water Supply & Sewerage, PWD, Electricity Board) through multi-modal grievance reporting, automated LLM categorization, YOLOv8 computer vision detection, and transparent officer resolution workflows.

Built from scratch using **Django (Python)**, **MongoDB**, and **React 18**.

---

## Architecture Overview

```
                      CITIZEN & USER ACCESS (WEB PORTAL)
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            │  Voice Notes  │  Photos & Videos  │  GPS Location   │  Formal Text
            └──────────────────────────┬──────────────────────────┘
                                       │
                                       ▼
                             ┌───────────────────┐
                             │   React 18 + Vite │
                             │  Tailwind CSS v3  │
                             │ (22 Languages UI) │
                             └─────────┬─────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
     [Citizen Portal]          [Staff / Officer]          [Super Admin Hub]
    • Submit Grievances       • Department Inbox         • Officer Approvals
    • Track Timeline          • Verify & Action          • Email Change Logs
    • Dispute Resolution      • Site Inspection Proofs   • Platform Analytics
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │ REST APIs & Multipart Uploads (JWT Protected)
                                       ▼
                           ┌─────────────────────────┐
                           │   Django REST Backend   │
                           │       (Port 8000)       │
                           └───────────┬─────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐           ┌──────────────────┐          ┌──────────────────┐
│ MongoDB Database│           │ AI Orchestration │          │ Communications   │
│ • Users & Roles │           │ • Gemini 1.5 API │          │ • Python SMTP    │
│ • Complaints    │           │ • OpenRouter API │          │   (Gmail SSL)    │
│ • Audit Logs    │           │ • YOLOv8 Vision  │          │ • OTP Dispatch   │
│ • Email Requests│           │ • Rule Fallback  │          │   (Email/SMS/WA) │
└─────────────────┘           └──────────────────┘          └──────────────────┘
```

---

## Key Features

### 1. Citizen Portal
- **Multi-Modal Grievance Reporting (`/report-problem`)**:
  - **Text Description**: Raw input formalized automatically by AI.
  - **Browser Voice Recorder**: Real-time microphone audio capture with waveform visualizer, playback, and re-recording.
  - **Image & Video Evidence**: Drag-and-drop file upload with simulated YOLO computer vision bounding box detection.
  - **One-Click Geolocation**: HTML5 GPS capture for auto-tagging incident coordinates and nearest landmarks.
  - **AI Formulation Card**: Gemini-powered automatic formalization converting informal complaints into structured official grievance statements.
  - **Category & Urgency Classification**: Auto-selection with manual override across 10+ civic & railway categories and urgency tiers (Low, Medium, High, Critical).
  - **Unique Grievance Tracking**: Formats official reference IDs (e.g., `RLY-2026-000001`, `MUN-2026-000002`, `JNS-2026-000003`).
- **Grievance Tracking & Citizen Verification (`/my-complaints`, `/complaint/:id`)**:
  - Filter by Active, In Progress, Resolved, Disputed, and Escalated statuses.
  - Interactive multi-stage timeline showing officer assignment, inspection notes, and timestamped actions.
  - **Resolution Verification Loop**: When marked *Resolved* by an officer, the citizen must inspect and verify:
    - **Accept**: Closes the grievance.
    - **Dispute**: Re-opens grievance with mandatory dispute notes and photographic proof.

### 2. Department Officer & Railway Dashboard (`/staff/dashboard`, `/railway-dashboard`)
- **Department Action Hub**: Live breakdown of departmental workload, urgent cases, and overdue complaints.
- **Complaint Inspector**: Side-by-side view of citizen raw complaint vs AI formalized statement, uploaded media, and detected objects.
- **Action Execution**:
  - Update progress stages (Under Review, In Progress, Scheduled).
  - Add internal field inspection notes and attach on-site proof photos.
  - **Mark as Resolved Modal**: Requires resolution report summary and proof photo.
  - **Department Escalation**: Elevates critical safety and unresolved issues to higher oversight cells (e.g., DRM Safety Cell).

### 3. Super Admin Portal (`/admin/dashboard`)
- **System Overview**: High-level platform statistics, departmental distribution metrics, and unresolved grievance escalations.
- **Staff & Officer Management**: Register, activate, or deactivate department officers and assign jurisdictional categories.
- **Official Email Change Approvals**: Review and approve/reject official email address change requests submitted by officers.
- **Audit Logging**: Comprehensive chronological trail of system-wide actions for transparency.

### 4. Multilingual & Accessibility Support
- **22 Indian Languages**: Built-in instant switching across official Indian languages (Hindi, English, Telugu, Bengali, Tamil, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, etc.) through `LanguageContext`.
- **National Identity Design**: Compliant with Government of India design standards featuring the State Emblem of India and the National Tricolor.

### 5. Security & Official Communications
- **Role-Based Authentication (RBAC)**: Distinct permissions for Citizens, Department Staff, and Super Admins powered by JSON Web Tokens (JWT).
- **Government OTP Verification**:
  - Multi-channel OTP verification (Email via Gmail SMTP, SMS, and WhatsApp simulation).
  - Mandatory OTP validation for citizen registration and password changes.
  - First-time login mandatory password reset workflow for department officers.

---

## Technology Stack

### Backend (`Django`)
- **Framework**: Django 5.x + Django REST Framework
- **Language**: Python 3.11+
- **Database**: MongoDB (via `pymongo` 4.x)
- **Security & Auth**: PyJWT, Bcrypt
- **CORS Handling**: `django-cors-headers`
- **Email Dispatch**: Standard library `smtplib` with SSL (Gmail SMTP & Development Simulator)
- **SMS & WhatsApp**: Twilio REST API integration & Development Simulator

### Frontend (`frontend/`)
- **Framework**: React 18.3 (Single Page Application)
- **Tooling & Bundler**: Vite 6.0
- **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer
- **Routing**: React Router v6
- **Icons**: Lucide React
- **API Client**: Axios (configured with dynamic `/api` routing)
- **State & Context**: AuthContext, LanguageContext (22 languages), ToastContext

### AI & Machine Learning Services
- **Generative AI / LLM**: Google Gemini API (`gemini-1.5-flash`) with OpenRouter fallback and a heuristic rule-based engine.
- **Computer Vision**: Simulated YOLOv8 detection bounding box overlays for potholes, garbage, pipe bursts, and live wires.

---

## Directory Structure

```text
JanSahayata-AI/
├── manage.py                             # Django CLI management script
├── requirements.txt                      # Python dependencies
├── seed.py                               # Database seeder for demo accounts & grievances
├── .env.example                          # Environment variables template
├── .env                                  # Active environment configuration
│
├── jansahayata/                          # Django Project Core Configuration
│   ├── __init__.py
│   ├── settings.py                       # Master Django settings, CORS, and Apps
│   ├── urls.py                           # Master URL routing & SPA fallback
│   ├── wsgi.py                           # WSGI entry point
│   ├── asgi.py                           # ASGI entry point
│   ├── db.py                             # MongoDB (PyMongo) connection & JWT/Bcrypt helpers
│   └── auth_middleware.py                # JWT & RBAC view decorators
│
├── apps/                                 # Django Modular Applications
│   ├── authentication/                   # User & Officer Auth, OTPs, Dual-OTP Email Change
│   │   ├── views.py
│   │   └── urls.py
│   ├── complaints/                       # Citizen Grievances, Uploads, Disputes, Timelines
│   │   ├── views.py
│   │   └── urls.py
│   ├── staff/                            # Officer Dashboard, Department Actions & Resolution
│   │   ├── views.py
│   │   └── urls.py
│   ├── admin_portal/                     # Super Admin Analytics, Officer CRUD, Audit Logs
│   │   ├── views.py
│   │   └── urls.py
│   ├── railway/                          # Railway-specific backward compatibility routes
│   │   ├── views.py
│   │   └── urls.py
│   └── ai_service/                       # AI Problem Formulation & Department Directory
│       ├── views.py
│       └── urls.py
│
├── services/                             # Core Business & Integration Services
│   ├── departments.py                    # 8 Indian Public Service Departments Configuration
│   ├── email_service.py                  # Official Government HTML Email Dispatcher
│   ├── messaging_service.py              # Twilio SMS / WhatsApp Dispatcher & Simulator
│   └── ai_engine.py                      # Gemini 1.5 Flash, OpenRouter & Rule Engine
│
├── frontend/                             # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/                   # UI Components (AudioRecorder, Timeline, etc.)
│   │   ├── context/                      # AuthContext, LanguageContext (22 languages)
│   │   ├── pages/                        # Citizen, Staff, Admin, Railway Dashboards
│   │   └── services/                     # Axios API client
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── uploads/                              # Uploaded Grievance Media
│   ├── images/                           # Photos of civic incidents & resolution proof
│   ├── videos/                           # Video evidence
│   └── audio/                            # Citizen voice recordings
└── README.md
```

---

## Quick Start & Setup

### 1. Prerequisites
- **Python 3.11+** installed
- **MongoDB** running locally on port `27017` (e.g., `mongodb://127.0.0.1:27017`)
- **Node.js 18+** (for frontend development if running Vite dev server)

### 2. Backend Setup (Django)

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Django Database Migrations** (for internal sessions & admin):
   ```bash
   python manage.py migrate
   ```

3. **Seed MongoDB with Official Government Accounts & Sample Complaints**:
   ```bash
   python seed.py
   # or
   python manage.py seed
   ```

4. **Start the Django Server**:
   ```bash
   python manage.py runserver
   ```
   The platform will be live at `http://127.0.0.1:8000/`.
   Because Django serves the built React frontend directly, you can open `http://127.0.0.1:8000/` immediately in your browser to access the complete UI!

---

### 3. Frontend Development (Optional for Hot Reload)

If you wish to make changes to the React frontend with Vite Hot Module Replacement (HMR):

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Vite Dev Server**:
   ```bash
   npm run dev
   ```
   The Vite dev server will run at `http://localhost:5173/` and automatically proxies all `/api` and `/uploads` requests to the Django backend at `http://127.0.0.1:8000/`.

3. **Rebuild the Frontend for Django Production**:
   ```bash
   npm run build
   ```

---

## Seeded Demo Credentials

| Role | Name | Email / ID | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Phaniswar | `admin@jansahayata.gov.in` | `Admin@JanSahayata2026!` | Full Platform, Officers, Audit Logs |
| **Railway Officer** | K. Kiran Sai Karthik | `officer.railway@jansahayata.gov.in` | `Officer@2026!` | Railway Grievances & Resolution Hub |
| **Water Supply Officer**| P. Balaji Sri Ram | `officer.water@jansahayata.gov.in` | `Officer@2026!` | Water & Sewerage Board Grievances |
| **Municipal Officer** | P. Balu Lakshman Pavan | `officer.muni@jansahayata.gov.in` | `Officer@2026!` | Municipal Sanitation & Civic Encroachments |
| **PWD Roads Officer** | K. Pavan Kalyan | `officer.roads@jansahayata.gov.in` | `Officer@2026!` | Potholes & Road Infrastructure |
| **Electricity Officer**| Allada Pavan | `officer.electricity@jansahayata.gov.in` | `Officer@2026!` | Power Distribution & Streetlights |
| **Demo Citizen** | Ravi Teja Sharma | `citizen@gmail.com` | `Citizen@2026!` | Report Grievance, Track, Dispute & Verify |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
