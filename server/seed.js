import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Complaint } from './models/Complaint.js';

dotenv.config();

const seedComplaints = [
  {
    complaintId: 'RLY-2026-000001',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'There is a large pothole and cracked pavement near platform 2 close to the tea stall, creating a severe tripping hazard for boarding passengers carrying luggage.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Pothole / Road Damage" located at "Platform 2 (North End)". Incident details indicate: "There is a large pothole and cracked pavement near platform 2 close to the tea stall, creating a severe tripping hazard for boarding passengers carrying luggage." Immediate technical assessment and departmental remediation are requested to uphold passenger safety and operational standards.',
    category: 'Pothole / Road Damage',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'High',
    location: {
      address: 'Secunderabad Junction - Platform 2, North Gate near Coach S4 position',
      latitude: 17.4344,
      longitude: 78.5015
    },
    attachments: {
      images: [],
      videos: [],
      audio: []
    },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Damaged Pavement / Pothole', confidence: 0.94, bbox: [22, 35, 54, 42] }
      ],
      confidence: 0.94,
      predictedCategory: 'Pothole / Road Damage',
      predictedUrgency: 'High',
      summary: 'Computer vision identified high probability (94%) of "Damaged Pavement / Pothole".',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'In Progress',
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted by citizen and logged in the Railway Grievance System.',
        officer: { name: 'Automated Ingestion Cell', department: 'Railway Department', role: 'System' },
        timestamp: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        status: 'Under Review',
        message: 'Grievance reviewed by Platform Section Supervisor. Assigned to Civil Engineering Team for inspection.',
        officer: { name: 'K. Ramesh Kumar', department: 'Railway Department', role: 'Station Superintendent' },
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        message: 'Civil repair crew deployed with cold mix asphalt and concrete leveling kit on Platform 2.',
        officer: { name: 'M. S. Ananth', department: 'Railway Department', role: 'Senior Section Engineer (Civil)' },
        timestamp: new Date(Date.now() - 6 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 36 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000002',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'Heavy overflow of garbage and discarded plastic food packets piled up right outside the main ticketing concourse.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Garbage / Waste" located at "Main Station Entrance Concourse". Incident details indicate: "Heavy overflow of garbage and discarded plastic food packets piled up right outside the main ticketing concourse." Immediate sanitation mobilization is required.',
    category: 'Garbage / Waste',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'Medium',
    location: {
      address: 'Main Entrance Ticket Counter Concourse, Central Railway Terminal',
      latitude: 17.4339,
      longitude: 78.5020
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Garbage Accumulation / Waste Pile', confidence: 0.91, bbox: [18, 28, 62, 55] }
      ],
      confidence: 0.91,
      predictedCategory: 'Garbage / Waste',
      predictedUrgency: 'Medium',
      summary: 'Computer vision identified high probability (91%) of "Garbage Accumulation / Waste Pile".',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Submitted',
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted by citizen. Automated priority ranking: Medium.',
        officer: { name: 'System Dispatcher', department: 'Railway Department', role: 'Automated Ingestion' },
        timestamp: new Date(Date.now() - 2 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000003',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'Severe water pipe bursting near Platform 4 passenger washroom causing water stagnation and slipping risk.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Water Leakage" located at "Platform 4 Washroom Complex". Water pipe rupture has caused waterlogging across the passenger movement corridor.',
    category: 'Water Leakage',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'High',
    location: {
      address: 'Platform 4 West End, Near Public Restroom Unit',
      latitude: 17.4348,
      longitude: 78.5011
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Water Pipe Leakage / Stagnation', confidence: 0.89, bbox: [25, 40, 50, 45] }
      ],
      confidence: 0.89,
      predictedCategory: 'Water Leakage',
      predictedUrgency: 'High',
      summary: 'Computer vision identified probability (89%) of "Water Pipe Leakage / Stagnation".',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Resolved',
    resolution: {
      notes: 'Plumbing maintenance unit replaced the damaged 2-inch PVC valve connector and sanitized the surrounding corridor with dry mop and disinfectant.',
      resolvedAt: new Date(Date.now() - 8 * 3600 * 1000),
      officer: 'S. N. Murthy (SSE Mechanical & Sanitation)',
      media: []
    },
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint registered.',
        officer: { name: 'System', department: 'Railway Department', role: 'Ingestion' },
        timestamp: new Date(Date.now() - 48 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        message: 'Sanitation emergency crew and plumbers dispatched to Platform 4.',
        officer: { name: 'S. N. Murthy', department: 'Railway Department', role: 'SSE Mechanical' },
        timestamp: new Date(Date.now() - 20 * 3600 * 1000)
      },
      {
        status: 'Resolved',
        message: 'Work completed: "Plumbing maintenance unit replaced the damaged 2-inch PVC valve connector and sanitized the surrounding corridor with dry mop and disinfectant." Awaiting citizen resolution verification.',
        officer: { name: 'S. N. Murthy', department: 'Railway Department', role: 'SSE Mechanical' },
        timestamp: new Date(Date.now() - 8 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 48 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000004',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'High-mast streetlight pole #14 at the premium two-wheeler parking lot is completely non-functional for past 3 days, causing unsafe dark conditions at night.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Broken Streetlight" located at "Two-Wheeler Parking Lot Pole 14". Electrical outage creates potential security vulnerability for commuters.',
    category: 'Broken Streetlight',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'Medium',
    location: {
      address: 'South Side Commuter Two-Wheeler Parking, Pole #14',
      latitude: 17.4332,
      longitude: 78.5028
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Faulty / Broken Luminaire', confidence: 0.95, bbox: [30, 15, 40, 60] }
      ],
      confidence: 0.95,
      predictedCategory: 'Broken Streetlight',
      predictedUrgency: 'Medium',
      summary: 'Computer vision identified probability (95%) of "Faulty / Broken Luminaire".',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Disputed',
    dispute: {
      isDisputed: true,
      reason: 'The officer marked it resolved, but only the base lamp was tested. The top LED floodlights are still blinking and turned off when it got dark at 7 PM.',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      media: []
    },
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted.',
        officer: { name: 'System', department: 'Railway Department', role: 'Ingestion' },
        timestamp: new Date(Date.now() - 72 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        message: 'Electrical lineman team assigned.',
        officer: { name: 'V. Prakash', department: 'Railway Department', role: 'SSE Electrical' },
        timestamp: new Date(Date.now() - 30 * 3600 * 1000)
      },
      {
        status: 'Resolved',
        message: 'Fuse replaced and breaker reset.',
        officer: { name: 'V. Prakash', department: 'Railway Department', role: 'SSE Electrical' },
        timestamp: new Date(Date.now() - 10 * 3600 * 1000)
      },
      {
        status: 'Disputed',
        message: 'Citizen rejected resolution: "The officer marked it resolved, but only the base lamp was tested. The top LED floodlights are still blinking and turned off when it got dark at 7 PM." Reopened for Railway Officer investigation.',
        officer: { name: 'Citizen Escalation', department: 'Railway Department', role: 'Dispute Mediation' },
        timestamp: new Date(Date.now() - 4 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 72 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000005',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'Construction debris, discarded metal sleepers, and gravel mounds left dangerously close to the operational track clearance gauge near Signal Post 12B.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Track / Railway Area Issue" located at "Signal Post 12B, Outer Track Zone". Debris encroachment near active lines creates a potential derailment or clearance violation.',
    category: 'Track / Railway Area Issue',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'Critical',
    location: {
      address: 'Outer Down-Line Track Clearance Zone, 200m North of Signal Post 12B',
      latitude: 17.4362,
      longitude: 78.4998
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Track Obstruction / Debris', confidence: 0.96, bbox: [10, 35, 80, 45] }
      ],
      confidence: 0.96,
      predictedCategory: 'Track / Railway Area Issue',
      predictedUrgency: 'Critical',
      summary: 'Computer vision identified probability (96%) of "Track Obstruction / Debris". Critical track safety alert.',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Escalated',
    escalation: {
      isEscalated: true,
      escalatedAt: new Date(Date.now() - 12 * 3600 * 1000),
      escalationReason: 'Track safety clearance violation detected. Requires immediate intervention by Permanent Way (P-Way) Safety Inspector & Divisional Operating Controller.',
      previousStatus: 'Under Review',
      escalatedTo: 'Divisional Railway Manager (DRM) Safety Cell & Chief Track Engineer'
    },
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted. AI Model flagged severity as Critical.',
        officer: { name: 'AI Safety Watchdog', department: 'Railway Department', role: 'Automated Triaging' },
        timestamp: new Date(Date.now() - 18 * 3600 * 1000)
      },
      {
        status: 'Under Review',
        message: 'Transferred to Divisional Control Room.',
        officer: { name: 'Senior Traffic Inspector', department: 'Railway Department', role: 'Traffic Control' },
        timestamp: new Date(Date.now() - 14 * 3600 * 1000)
      },
      {
        status: 'Escalated',
        message: 'Complaint escalated to Divisional Railway Manager (DRM) Safety Cell & Chief Track Engineer. Reason: "Track safety clearance violation detected. Requires immediate intervention by Permanent Way (P-Way) Safety Inspector & Divisional Operating Controller."',
        officer: { name: 'Senior Traffic Inspector', department: 'Railway Department', role: 'Escalations Officer' },
        timestamp: new Date(Date.now() - 12 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 18 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000006',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'Stainless steel bench on Platform 1 has sharp broken welds which torn a commuter jacket and could cause physical cuts to passengers waiting for express trains.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Passenger Facility Problem" located at "Platform 1 Waiting Bay 3". Structural damage on passenger seating fixture requires maintenance replacement.',
    category: 'Passenger Facility Problem',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'Medium',
    location: {
      address: 'Platform 1 Waiting Area, Near AC Waiting Hall Entrance',
      latitude: 17.4341,
      longitude: 78.5018
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Damaged Passenger Seating / Fixture', confidence: 0.90, bbox: [25, 30, 50, 45] }
      ],
      confidence: 0.90,
      predictedCategory: 'Passenger Facility Problem',
      predictedUrgency: 'Medium',
      summary: 'Computer vision identified probability (90%) of "Damaged Passenger Seating / Fixture".',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Under Review',
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted by citizen.',
        officer: { name: 'System Dispatcher', department: 'Railway Department', role: 'Ingestion' },
        timestamp: new Date(Date.now() - 16 * 3600 * 1000)
      },
      {
        status: 'Under Review',
        message: 'Station Master verified the location and scheduled welding repair with Mechanical Depot.',
        officer: { name: 'A. K. Srivastava', department: 'Railway Department', role: 'Station Manager' },
        timestamp: new Date(Date.now() - 5 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 16 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000007',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'Main open storm drainage channel near the auto-rickshaw stand outside station gate 2 is clogged with silt, creating foul odors and water accumulation.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Drainage Problem" located at "Station Gate 2 Auto Stand". Silt accumulation has obstructed drainage runoff.',
    category: 'Drainage Problem',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'Low',
    location: {
      address: 'Station Exit Gate 2, Commercial Auto Rickshaw Stand',
      latitude: 17.4330,
      longitude: 78.5022
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Clogged / Overflowing Drain', confidence: 0.88, bbox: [20, 30, 60, 50] }
      ],
      confidence: 0.88,
      predictedCategory: 'Drainage Problem',
      predictedUrgency: 'Low',
      summary: 'Computer vision identified probability (88%) of "Clogged / Overflowing Drain".',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Accepted',
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted by citizen.',
        officer: { name: 'System Dispatcher', department: 'Railway Department', role: 'Ingestion' },
        timestamp: new Date(Date.now() - 28 * 3600 * 1000)
      },
      {
        status: 'Accepted',
        message: 'Grievance accepted by Railway Sanitation wing. Scheduled for mechanized desilting.',
        officer: { name: 'R. B. Chari', department: 'Railway Department', role: 'Sanitation Inspector' },
        timestamp: new Date(Date.now() - 18 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 28 * 3600 * 1000)
  },
  {
    complaintId: 'RLY-2026-000008',
    citizenId: 'CITIZEN-DEMO-001',
    description: 'Escalator connecting Foot Over Bridge 2 to Platform 3 was stopped with emergency trip light on.',
    aiGeneratedDescription: 'Formal Grievance Report: A citizen has reported an issue concerning "Railway Infrastructure Damage" located at "Foot Over Bridge 2 - Platform 3 Escalator". Escalator emergency sensor reset required.',
    category: 'Railway Infrastructure Damage',
    department: {
      id: 'railway',
      code: 'RLY',
      name: 'Railway Department'
    },
    urgency: 'High',
    location: {
      address: 'Foot Over Bridge 2, Escalator Link down to Platform 3',
      latitude: 17.4346,
      longitude: 78.5014
    },
    attachments: { images: [], videos: [], audio: [] },
    aiAnalysis: {
      detectedObjects: [
        { label: 'Structural Cracks / Platform Hazard', confidence: 0.93, bbox: [15, 20, 70, 60] }
      ],
      confidence: 0.93,
      predictedCategory: 'Railway Infrastructure Damage',
      predictedUrgency: 'High',
      summary: 'Computer vision identified escalator safety stoppage.',
      modelVersion: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)'
    },
    status: 'Closed',
    resolution: {
      notes: 'Escalator OEM technician cleared object stuck in comb plate, reset safety interlocks, and tested operation for 30 minutes.',
      resolvedAt: new Date(Date.now() - 50 * 3600 * 1000),
      officer: 'T. V. Narayana (Electrical Escalator Division)',
      media: []
    },
    verification: {
      isVerified: true,
      verifiedAt: new Date(Date.now() - 40 * 3600 * 1000),
      feedback: 'Verified working smoothly when I took train 12723 this morning. Thanks for fast action!'
    },
    progressUpdates: [
      {
        status: 'Submitted',
        message: 'Complaint submitted.',
        officer: { name: 'System', department: 'Railway Department', role: 'Ingestion' },
        timestamp: new Date(Date.now() - 96 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        message: 'OEM maintenance engineer dispatched.',
        officer: { name: 'T. V. Narayana', department: 'Railway Department', role: 'SSE Electrical' },
        timestamp: new Date(Date.now() - 60 * 3600 * 1000)
      },
      {
        status: 'Resolved',
        message: 'Work completed: "Escalator OEM technician cleared object stuck in comb plate, reset safety interlocks, and tested operation for 30 minutes."',
        officer: { name: 'T. V. Narayana', department: 'Railway Department', role: 'SSE Electrical' },
        timestamp: new Date(Date.now() - 50 * 3600 * 1000)
      },
      {
        status: 'Closed',
        message: 'Resolution verified and accepted by citizen. Feedback: "Verified working smoothly when I took train 12723 this morning. Thanks for fast action!"',
        officer: { name: 'Citizen Verification', department: 'Railway Department', role: 'Citizen Portal' },
        timestamp: new Date(Date.now() - 40 * 3600 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 96 * 3600 * 1000)
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance_platform';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    await Complaint.deleteMany({});
    console.log('[Seed] Cleared existing complaints.');

    const inserted = await Complaint.insertMany(seedComplaints);
    console.log(`[Seed] Successfully inserted ${inserted.length} realistic demo complaints!`);

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDB();
