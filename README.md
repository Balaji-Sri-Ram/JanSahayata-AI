# JanSahayata AI (CPGRAMS) — Multi-Department Citizen Grievance Redressal & Mediation Platform

An AI-powered, multi-department Civic & Railway Grievance Redressal Platform built in alignment with Government of India digital governance standards (CPGRAMS / JanSahayata). Connecting citizens directly with government departments (Railways, Municipal Corporation, Water Supply & Sewerage, PWD, Electricity Board) through multi-modal grievance reporting, automated LLM categorization, YOLOv8 computer vision detection, and transparent officer resolution workflows.

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
                           ┌────────────────────────┐
                           │ Node.js + Express API  │
                           │      (Port 5001)       │
                           └───────────┬────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐           ┌──────────────────┐          ┌──────────────────┐
│ MongoDB Database│           │ AI Orchestration │          │ Communications   │
│ • Users & Roles │           │ • Gemini 1.5 API │          │ • Nodemailer     │
│ • Complaints    │           │ • OpenRouter API │          │   (Gmail SMTP)   │
│ • Audit Logs    │           │ • YOLOv8 Vision  │          │ • OTP Dispatch   │
│ • Email Requests│           │ • Fallback Engine│          │   (Email/SMS/WA) │
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
  - **Unique Grievance Tracking**: Formats official reference IDs (e.g., `RLY-2026-000001`, `MUN-2026-000002`).
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

### Frontend (`client/`)
- **Framework**: React 18.3 (Single Page Application)
- **Tooling & Bundler**: Vite 6.0
- **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer
- **Routing**: React Router v6
- **Icons**: Lucide React
- **API Client**: Axios
- **State & Context**: AuthContext, LanguageContext (22 languages), ToastContext

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express.js 4.21
- **Database & ODM**: MongoDB with Mongoose 8.9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **File Uploads**: Multer (multi-part support for images, videos, audio)
- **Email Notifications**: Nodemailer (Gmail SMTP dispatch for official government alerts & OTPs)
- **Logging & Utilities**: Morgan, UUID, Dotenv, CORS

### AI & Machine Learning Services
- **Generative AI / LLM**: Google Gemini API (`gemini-1.5-flash`) with OpenRouter fallback and a heuristic rule-based engine.
- **Computer Vision**: YOLOv8 dataset integration (`Datasets/Pothole Dataset`) with bounding box preview.
- **Speech-to-Text**: Voice recording interface ready for Whisper transcription API bridge.

---

## Directory Structure

```text
CAPSTONE/
├── client/                               # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/                   # Shared UI Components
│   │   │   ├── AudioRecorder.jsx         # Browser audio recorder with waveform
│   │   │   ├── ChangePasswordModal.jsx   # Password change modal
│   │   │   ├── CitizenEmailChangeModal.jsx # Citizen email update with OTP
│   │   │   ├── EmblemLogo.jsx            # State Emblem of India
│   │   │   ├── FirstTimePasswordResetModal.jsx # Officer first-time login modal
│   │   │   ├── Footer.jsx                # Government portal footer
│   │   │   ├── Header.jsx                # Main navigation & language selector
│   │   │   ├── ImageUploadPreview.jsx    # Photo/video drag-and-drop preview
│   │   │   ├── IndianFlag.jsx            # Indian tricolor SVG component
│   │   │   ├── LanguageDropdown.jsx      # 22-language switcher
│   │   │   ├── OfficerEmailChangeModal.jsx # Officer email request modal
│   │   │   ├── ProtectedRoute.jsx        # Role-based route guard
│   │   │   ├── StatusBadge.jsx           # Grievance status badge
│   │   │   ├── Timeline.jsx              # Status progression timeline
│   │   │   └── UrgencyBadge.jsx          # Urgency indicator chip
│   │   ├── context/                      # React Context Providers
│   │   │   ├── AuthContext.jsx           # User session & role management
│   │   │   ├── LanguageContext.jsx       # 22 Indian languages dictionary
│   │   │   └── ToastContext.jsx          # Global toast notification provider
│   │   ├── pages/
│   │   │   ├── admin/                    # Admin Dashboard & Email Requests
│   │   │   ├── auth/                     # Citizen & Staff Login / Register
│   │   │   ├── citizen/                  # Home, Report Problem, My Complaints
│   │   │   ├── railway/                  # Railway Specific Dashboard
│   │   │   └── staff/                    # Department Staff Inbox & Detail
│   │   ├── services/
│   │   │   └── api.js                    # Axios API configuration & intercepts
│   │   ├── App.jsx                       # Master route tree
│   │   ├── index.css                     # Global styles & Tailwind directives
│   │   └── main.jsx                      # React application entry point
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                               # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js                         # MongoDB connection handler
│   │   └── departments.js                # Department registry configuration
│   ├── controllers/
│   │   ├── adminController.js            # Admin metrics & officer approvals
│   │   ├── authController.js             # RBAC auth, login, OTP dispatch
│   │   ├── complaintController.js        # Complaint CRUD & citizen workflows
│   │   └── staffController.js            # Department officer complaint actions
│   ├── middleware/
│   │   └── upload.js                     # Multer storage configuration
│   ├── models/
│   │   ├── AuditLog.js                   # System audit logs schema
│   │   ├── Complaint.js                  # Grievance complaint schema
│   │   ├── EmailChangeRequest.js         # Officer email approval requests
│   │   └── User.js                       # User & staff authentication schema
│   ├── routes/
│   │   ├── adminRoutes.js                # Super Admin API endpoints
│   │   ├── aiRoutes.js                   # AI analysis endpoints
│   │   ├── authRoutes.js                 # Authentication & OTP routes
│   │   ├── complaintRoutes.js            # Citizen complaint routes
│   │   ├── railwayRoutes.js              # Railway specific endpoints
│   │   └── staffRoutes.js                # Staff grievance processing routes
│   ├── services/
│   │   ├── ai/
│   │   │   └── aiService.js              # Gemini/OpenRouter & YOLO vision bridge
│   │   ├── emailService.js               # Nodemailer Gmail SMTP OTP service
│   │   └── messagingService.js           # Multi-channel notification bridge
│   ├── uploads/                          # Stored media (images, videos, audio)
│   ├── .env.example                      # Template for backend environment variables
│   ├── seed.js                           # Database seeder for demo accounts & data
│   └── server.js                         # Express application entry point
│
├── Datasets/
│   └── Pothole Dataset/                  # YOLO annotated computer vision dataset
└── README.md
```

---

## Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/grievance_platform
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# LLM Configuration (Google Gemini / OpenRouter)
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
LLM_PROVIDER=auto

# Security & Authentication
JWT_SECRET=your_jwt_secret_key_here
SUPER_ADMIN_EMAIL=admin@jansahayata.gov.in
SUPER_ADMIN_PASSWORD=Admin@JanSahayata2026!

# Official Government Email & OTP Dispatch (Gmail SMTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_google_app_password
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or MongoDB Atlas connection URI)

### 2. Backend Setup
```bash
cd server
npm install

# Seed the database with demo users, officers, and complaints
npm run seed

# Start development server
npm run dev
# Backend runs on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Default Seeded Accounts

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@jansahayata.gov.in` | `Admin@JanSahayata2026!` | `/admin/dashboard` |
| **Railway Officer** | `officer.railway@jansahayata.gov.in` | `Officer@123` | `/staff/dashboard` |
| **Municipal Officer** | `officer.municipality@jansahayata.gov.in` | `Officer@123` | `/staff/dashboard` |
| **Water Supply Officer** | `officer.water@jansahayata.gov.in` | `Officer@123` | `/staff/dashboard` |
| **Demo Citizen** | `citizen@example.com` | `Citizen@123` | `/report-problem`, `/my-complaints` |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
