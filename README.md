# RailSewa AI — Citizen–Government Grievance Mediation Platform (MVP)

A modern, full-stack, AI-powered Grievance Mediation Platform connecting Indian railway passengers directly with Railway Department operations. Built with a modular architecture ready for Python FastAPI microservice integration (YOLOv8, Whisper, and LLMs).

---

## Architecture Overview

```
                      CITIZEN INTERFACE                     RAILWAY OPERATIONS
                              │                                     │
           ┌──────────────────┴──────────────────┐                  │
           │  Text  │  Photos  │  Video  │ Voice │                  │
           └──────────────────┬──────────────────┘                  │
                              │                                     │
                              ▼                                     ▼
                    ┌───────────────────┐               ┌───────────────────────┐
                    │  Citizen Portal   │               │ Railway Dept Dashboard│
                    │  (React + Tailwind)│              │  (Action Hub / Inbox) │
                    └─────────┬─────────┘               └───────────┬───────────┘
                              │                                     │
                              └───────────────────┬─────────────────┘
                                                  │ REST APIs & Multi-part
                                                  ▼
                                      ┌────────────────────────┐
                                      │ Node.js + Express API  │
                                      │  (Port 5001)           │
                                      └───────────┬────────────┘
                                                  │
                            ┌─────────────────────┴─────────────────────┐
                            ▼                                           ▼
                 ┌────────────────────┐                    ┌─────────────────────────┐
                 │  MongoDB Database  │                    │ Modular AI Service      │
                 │  (Mongoose Models) │                    │ Bridge (FastAPI ready)  │
                 └────────────────────┘                    └─────────────────────────┘
                                                                        │
                                                           ┌────────────┴────────────┐
                                                           ▼                         ▼
                                                     [YOLOv8 Vision]           [Whisper STT]
                                                     [LLM Formulator]          [Dept Classifier]
```

---

## Key Features Implemented in MVP

### 1. Citizen Portal
- **Home & Live Activity**: Quick complaint counter, "How AI Works" step-by-step pipeline, and recent status stream.
- **Multi-Modal Grievance Reporting (`/report-problem`)**:
  - Detailed text description.
  - **Browser Microphone Voice Recorder**: Live waveform, recording timer, playback bar, delete, and re-record.
  - **Image & Video Uploads**: Drag-and-drop, max size limits, photo preview grid with mock YOLO bounding box preview.
  - **GPS Geolocation**: Single-click *"Use My Current Location"* with coordinates capture.
  - **Modular Category & Urgency Selectors**: Multi-level urgency (Low, Medium, High, Critical).
  - **AI-Assisted Complaint Processing Card**: Demo mode badge, automated formal problem statement generator with direct citizen editing.
  - **Confirmation Checkbox**: Mandatory validation before submission.
  - **Unique Complaint ID Generation**: Generates sequential IDs (e.g., `RLY-2026-000001`).
- **My Complaints Hub (`/my-complaints`)**: Status tabs (Active, In Progress, Resolved, Disputed, Escalated), live search, and metadata chips.
- **Complaint Details & Resolution Verification (`/complaint/:id`)**:
  - Full evidence gallery (images, videos, audio notes).
  - Vertical progress timeline with officer audit stamps.
  - **Resolution Verification**: When an officer marks an issue *Resolved*, the citizen can click *"Yes, Problem Resolved"* (marks `Closed`) or *"No, Problem Still Exists"* to submit a dispute with notes and photo evidence.

### 2. Railway Department Dashboard
- **Executive Overview (`/railway-dashboard`)**: Real-time stats cards directly queried from MongoDB (Total, Submitted, Under Review, In Progress, Resolved, Disputed, Escalated), category breakdown analytics, and urgent action queue.
- **Disputed Complaints Alert**: Prominent notification for cases rejected by citizens requiring re-inspection.
- **Department Inbox (`/railway-dashboard/complaints`)**: Multi-filter table (Status, Urgency, Category, Keyword/Location search).
- **Officer Complaint Inspector (`/railway-dashboard/complaints/:id`)**:
  - Raw citizen description vs AI synthesized problem statement.
  - AI Computer Vision card with mock YOLO bounding box overlay and confidence rating (94%).
  - Officer Action Center: Status updater, progress notes logger with site photo upload.
  - **Mark as Resolved Modal**: Requires completion description & optional proof photo.
  - **Escalation Modal**: Transfers grievance to Divisional Railway Manager (DRM) safety cell with escalation reason.

---

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Vite, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js (ES Modules), Express.js, MongoDB, Mongoose, Multer (multipart uploads), Morgan.
- **Database**: MongoDB (Local instance `mongodb://127.0.0.1:27017/grievance_platform`).

---

## Directory Structure

```text
CAPSTONE/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # StatusBadge, UrgencyBadge, Header, AudioRecorder, ImageUploadPreview, Timeline
│   │   ├── pages/
│   │   │   ├── citizen/        # CitizenHome, ReportProblem, MyComplaints, ComplaintDetails
│   │   │   └── railway/        # RailwayDashboard, RailwayComplaints, RailwayComplaintDetail
│   │   ├── services/api.js     # Axios API layer
│   │   ├── App.jsx             # Routes definition
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── departments.js      # Modular department registry (Railway, Municipality, etc.)
│   ├── controllers/
│   │   └── complaintController.js # Citizen & Railway controllers
│   ├── middleware/
│   │   └── upload.js           # Multer media handler (images, video, audio)
│   ├── models/
│   │   └── Complaint.js        # Mongoose Complaint schema
│   ├── routes/
│   │   ├── complaintRoutes.js  # Citizen REST routes
│   │   ├── railwayRoutes.js    # Railway Department REST routes
│   │   └── aiRoutes.js         # AI preview endpoints
│   ├── services/
│   │   └── ai/aiService.js     # AI pipeline interface (FastAPI bridge ready)
│   ├── uploads/                # Local uploaded images, videos, voice recordings
│   ├── seed.js                 # Seed demo railway complaints across all statuses
│   └── server.js               # Express server entrypoint
│
└── README.md
```

---

## Quick Start & Verification

### 1. Start MongoDB & Seed Demo Data
```bash
# Seed realistic demo complaints
cd server
npm run seed
```

### 2. Start Backend Server
```bash
cd server
npm start
# Running on http://localhost:5001
```

### 3. Start Frontend Client
```bash
cd client
npm run dev
# Running on http://localhost:5173
```
