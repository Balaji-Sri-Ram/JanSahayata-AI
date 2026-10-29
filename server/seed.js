import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Complaint } from './models/Complaint.js';
import { AuditLog } from './models/AuditLog.js';
import { connectDB } from './config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB database.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing User, Complaint, and AuditLog data.');

    // 1. Seed Super Admin
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@JanSahayata2026!';
    const adminPasswordHash = await User.hashPassword(adminPassword);
    const superAdmin = await User.create({
      name: 'Phaniswar',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@jansahayata.gov.in',
      phone: '+91 94150 11223',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      department: {
        id: 'governance',
        code: 'GOV',
        name: 'Ministry of Public Grievance & Administrative Reforms'
      },
      employeeId: 'DIR-ADM-0001',
      designation: 'Principal Secretary / Chief Administrative Director',
      status: 'Active'
    });
    console.log(`[Seed] Created Super Admin: ${superAdmin.email}`);

    // 2. Seed Government Employees
    const officerPasswordHash = await User.hashPassword('Officer@2026!');
    const employees = await User.create([
      {
        name: 'K. Kiran Sai Karthik',
        email: 'officer.railway@jansahayata.gov.in',
        phone: '+91 98480 22334',
        passwordHash: officerPasswordHash,
        role: 'EMPLOYEE',
        department: {
          id: 'railway',
          code: 'RLY',
          name: 'Railway Department'
        },
        employeeId: 'RLY-EMP-1001',
        designation: 'Station Superintendent / Zonal Grievance Officer',
        status: 'Active'
      },
      {
        name: 'P. Balaji Sri Ram',
        email: 'officer.water@jansahayata.gov.in',
        phone: '+91 97230 44556',
        passwordHash: officerPasswordHash,
        role: 'EMPLOYEE',
        department: {
          id: 'water_supply',
          code: 'WTR',
          name: 'Water Supply & Sewerage Board'
        },
        employeeId: 'WTR-EMP-2001',
        designation: 'Assistant Executive Engineer (Water Works)',
        status: 'Active'
      },
      {
        name: 'P. Balu Lakshman Pavan',
        email: 'officer.muni@jansahayata.gov.in',
        phone: '+91 96120 77889',
        passwordHash: officerPasswordHash,
        role: 'EMPLOYEE',
        department: {
          id: 'municipality',
          code: 'MUN',
          name: 'Municipal Corporation'
        },
        employeeId: 'MUN-EMP-3001',
        designation: 'Chief Sanitary Inspector (Zone 4)',
        status: 'Active'
      },
      {
        name: 'K. Pavan Kalyan',
        email: 'officer.roads@jansahayata.gov.in',
        phone: '+91 95010 33445',
        passwordHash: officerPasswordHash,
        role: 'EMPLOYEE',
        department: {
          id: 'roads_infra',
          code: 'RDS',
          name: 'Roads & Infrastructure (PWD)'
        },
        employeeId: 'RDS-EMP-4001',
        designation: 'Assistant Engineer (Civil Infrastructure)',
        status: 'Active'
      },
      {
        name: 'Allada Pavan',
        email: 'officer.electricity@jansahayata.gov.in',
        phone: '+91 94400 55667',
        passwordHash: officerPasswordHash,
        role: 'EMPLOYEE',
        department: {
          id: 'electricity',
          code: 'ELE',
          name: 'Electricity Board (DISCOM)'
        },
        employeeId: 'ELE-EMP-5001',
        designation: 'Assistant Divisional Engineer (Power & Distribution)',
        status: 'Active'
      }
    ]);
    console.log(`[Seed] Created ${employees.length} Department Officers.`);

    // 3. Seed Verified Citizen Account
    const citizenPasswordHash = await User.hashPassword('Citizen@2026!');
    const citizen = await User.create({
      name: 'Ravi Teja Sharma',
      email: 'citizen@jansahayata.gov.in',
      phone: '+91 98765 43210',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN',
      status: 'Active'
    });
    console.log(`[Seed] Created Verified Citizen: ${citizen.email}`);

    // 4. Seed Realistic Grievance Complaints
    const complaintsData = [
      {
        complaintId: 'JNS-2026-000001',
        citizenId: String(citizen._id),
        citizenDetails: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        },
        description: 'There is a deep pothole and cracked stone pavement near platform 2 close to the central tea kiosk, creating a severe tripping hazard for boarding passengers carrying heavy luggage.',
        generatedProblemStatement: 'Formal Grievance: Damaged pavement and hazardous pothole detected at Platform 2 (North Section). High pedestrian footfall during peak train boarding hours requires urgent masonry and asphalt leveling.',
        aiGeneratedDescription: 'Formal Grievance: Damaged pavement and hazardous pothole detected at Platform 2 (North Section).',
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
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'Damaged Pavement / Pothole', confidence: 0.94, bbox: [22, 35, 54, 42] }],
          confidence: 0.94,
          predictedCategory: 'Pothole / Road Damage',
          predictedUrgency: 'High',
          summary: 'Image analysis identified high probability (94%) of pavement structural hazard.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'In Progress',
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Grievance submitted by citizen and routed automatically to Railway Department.',
            officer: { name: 'JanSahayata System', department: 'Railway Department', role: 'Automated Dispatch' },
            timestamp: new Date(Date.now() - 36 * 3600 * 1000)
          },
          {
            status: 'Under Review',
            message: 'Grievance reviewed by Platform Superintendent. Forwarded to Civil Engineering Team.',
            officer: { name: 'K. Kiran Sai Karthik', department: 'Railway Department', role: 'Station Superintendent' },
            timestamp: new Date(Date.now() - 24 * 3600 * 1000)
          },
          {
            status: 'In Progress',
            message: 'Civil repair crew deployed on Platform 2 with quick-setting polymer concrete mix.',
            officer: { name: 'M. S. Ananth', department: 'Railway Department', role: 'Senior Section Engineer' },
            timestamp: new Date(Date.now() - 6 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        complaintId: 'JNS-2026-000002',
        citizenId: String(citizen._id),
        citizenDetails: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        },
        description: 'Main drinking water pipeline has burst near the community market area, resulting in heavy water loss and low pressure across 200 residential households since morning.',
        generatedProblemStatement: 'Civic Alert: Potable water main distribution line breach near Sector 4 Community Market. Urgent valve isolation and pipe coupling replacement required to restore household supply.',
        aiGeneratedDescription: 'Civic Alert: Potable water main distribution line breach near Sector 4 Community Market.',
        category: 'Water Leakage',
        department: {
          id: 'water_supply',
          code: 'WTR',
          name: 'Water Supply & Sewerage Board'
        },
        urgency: 'Critical',
        location: {
          address: 'Sector 4 Community Market Main Road, Near Water Tank 3',
          latitude: 17.4421,
          longitude: 78.4982
        },
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'High-Pressure Water Burst', confidence: 0.96, bbox: [15, 20, 70, 60] }],
          confidence: 0.96,
          predictedCategory: 'Water Leakage',
          predictedUrgency: 'Critical',
          summary: 'High-volume potable water wastage verified.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'Under Review',
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Grievance submitted with Critical priority tag.',
            officer: { name: 'JanSahayata Ingestion', department: 'Water Supply & Sewerage Board', role: 'System' },
            timestamp: new Date(Date.now() - 4 * 3600 * 1000)
          },
          {
            status: 'Under Review',
            message: 'Emergency repair squad alerted. Sluice valve isolated to prevent further flooding.',
            officer: { name: 'P. Balaji Sri Ram', department: 'Water Supply & Sewerage Board', role: 'Assistant Executive Engineer' },
            timestamp: new Date(Date.now() - 1 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 4 * 3600 * 1000)
      },
      {
        complaintId: 'JNS-2026-000003',
        citizenId: String(citizen._id),
        citizenDetails: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        },
        description: 'Large garbage heap accumulating outside the municipal primary school gate. Stray animals are gathering and scattering waste onto the walkway.',
        generatedProblemStatement: 'Public Sanitation: Solid waste dumping near Municipal Primary School Gate (Ward 12). Poses health and vector safety hazard to school children. Immediate compactor truck deployment needed.',
        aiGeneratedDescription: 'Public Sanitation: Solid waste dumping near Municipal Primary School Gate.',
        category: 'Garbage / Waste',
        department: {
          id: 'municipality',
          code: 'MUN',
          name: 'Municipal Corporation'
        },
        urgency: 'High',
        location: {
          address: 'Ward 12, Municipal Primary School Lane, Gandhi Nagar',
          latitude: 17.4298,
          longitude: 78.5088
        },
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'Solid Waste / Garbage Pile', confidence: 0.92, bbox: [20, 30, 60, 50] }],
          confidence: 0.92,
          predictedCategory: 'Garbage / Waste',
          predictedUrgency: 'High',
          summary: 'Garbage pile detected within 50 meters of educational institution.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'Resolved',
        resolution: {
          notes: 'Sanitation team deployed mechanical compactor truck. Cleared 1.8 metric tons of waste and disinfected the school perimeter with bleaching powder.',
          resolvedAt: new Date(Date.now() - 5 * 3600 * 1000),
          officer: 'P. Balu Lakshman Pavan (Chief Sanitary Inspector)'
        },
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Complaint submitted by citizen.',
            officer: { name: 'System', department: 'Municipal Corporation', role: 'Automated Dispatch' },
            timestamp: new Date(Date.now() - 28 * 3600 * 1000)
          },
          {
            status: 'In Progress',
            message: 'Sanitation vehicle assigned to Ward 12 route.',
            officer: { name: 'P. Balu Lakshman Pavan', department: 'Municipal Corporation', role: 'Chief Sanitary Inspector' },
            timestamp: new Date(Date.now() - 12 * 3600 * 1000)
          },
          {
            status: 'Resolved',
            message: 'Waste removed completely and area disinfected. Awaiting citizen resolution verification.',
            officer: { name: 'P. Balu Lakshman Pavan', department: 'Municipal Corporation', role: 'Chief Sanitary Inspector' },
            timestamp: new Date(Date.now() - 5 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 28 * 3600 * 1000)
      },
      {
        complaintId: 'JNS-2026-000004',
        citizenId: String(citizen._id),
        citizenDetails: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        },
        description: 'Road cave-in and broken drainage culvert on State Highway link road creating heavy traffic jam and risk of two-wheeler accidents.',
        generatedProblemStatement: 'Road Infrastructure: Structural culvert collapse on Highway Link Road. PWD emergency barricading and slab reconstruction required.',
        aiGeneratedDescription: 'Road Infrastructure: Structural culvert collapse on Highway Link Road.',
        category: 'Pothole / Road Damage',
        department: {
          id: 'roads_infra',
          code: 'RDS',
          name: 'Roads & Infrastructure (PWD)'
        },
        urgency: 'Critical',
        location: {
          address: 'State Highway Link Road, KM 14 Marker near Ring Road Flyover',
          latitude: 17.4112,
          longitude: 78.4721
        },
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'Culvert Collapse / Cave-in', confidence: 0.95, bbox: [25, 20, 50, 60] }],
          confidence: 0.95,
          predictedCategory: 'Pothole / Road Damage',
          predictedUrgency: 'Critical',
          summary: 'Severe road surface failure on high-speed corridor.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'Disputed',
        dispute: {
          isDisputed: true,
          reason: 'Officer marked resolved previously, but only temporary mud was dumped into the pit which washed away in light rain. Deep hole is still exposed.',
          createdAt: new Date(Date.now() - 8 * 3600 * 1000)
        },
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Grievance submitted by citizen.',
            officer: { name: 'System', department: 'Roads & Infrastructure (PWD)', role: 'Ingestion' },
            timestamp: new Date(Date.now() - 48 * 3600 * 1000)
          },
          {
            status: 'Resolved',
            message: 'Temporary patching completed by local gang.',
            officer: { name: 'K. Pavan Kalyan', department: 'Roads & Infrastructure (PWD)', role: 'Assistant Engineer' },
            timestamp: new Date(Date.now() - 16 * 3600 * 1000)
          },
          {
            status: 'Disputed',
            message: 'Citizen disputed resolution: Mud filling washed away; permanent RCC pre-cast slab repair required. Reopened for engineer reinspection.',
            officer: { name: 'Citizen Dispute Portal', department: 'Roads & Infrastructure (PWD)', role: 'Citizen' },
            timestamp: new Date(Date.now() - 8 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 48 * 3600 * 1000)
      },
      {
        complaintId: 'JNS-2026-000005',
        citizenId: 'CITIZEN-DEMO-001',
        citizenDetails: {
          name: 'Priya Nambiar',
          email: 'priya.n@example.com',
          phone: '+91 94451 88990'
        },
        description: 'Dangling high-voltage electricity cable hanging within reach of pedestrians on Park Avenue sidewalk near Electric Transformer 14.',
        generatedProblemStatement: 'Power Hazard: Live overhead electricity conductor dislodged from insulator arm on Park Avenue. High shock risk to school children and commuters.',
        aiGeneratedDescription: 'Power Hazard: Live overhead electricity conductor dislodged from insulator arm.',
        category: 'Broken Streetlight',
        department: {
          id: 'electricity',
          code: 'ELE',
          name: 'Electricity Board (DISCOM)'
        },
        urgency: 'Critical',
        location: {
          address: 'Park Avenue Sidewalk, Opposite Community Hall, Transformer #14',
          latitude: 17.4389,
          longitude: 78.4891
        },
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'Overhead Wire Hazard', confidence: 0.97, bbox: [10, 15, 80, 70] }],
          confidence: 0.97,
          predictedCategory: 'Broken Streetlight',
          predictedUrgency: 'Critical',
          summary: 'Extreme electrical safety risk detected near pedestrian path.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'Escalated',
        escalation: {
          isEscalated: true,
          escalatedAt: new Date(Date.now() - 2 * 3600 * 1000),
          escalationReason: 'Emergency life safety hazard - Line tensioning gang dispatched on priority code red.',
          previousStatus: 'In Progress',
          escalatedTo: 'Executive Engineer (Safety & Distribution)'
        },
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Grievance submitted by citizen.',
            officer: { name: 'System', department: 'Electricity Board (DISCOM)', role: 'Ingestion' },
            timestamp: new Date(Date.now() - 10 * 3600 * 1000)
          },
          {
            status: 'Escalated',
            message: 'Escalated to Executive Engineer (Safety & Distribution) due to life-hazard category.',
            officer: { name: 'Discom Dispatch Cell', department: 'Electricity Board (DISCOM)', role: 'Sub-Divisional Officer' },
            timestamp: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 10 * 3600 * 1000)
      },
      {
        complaintId: 'JNS-2026-000006',
        citizenId: String(citizen._id),
        citizenDetails: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        },
        description: 'Bio-toilet flush mechanism broken in Coach B3 of Train 12723 (Telangana Express). Water running continuously and floor is flooded.',
        generatedProblemStatement: 'Passenger Facility: Bio-toilet flush valve stuck open in Coach B3 (Train 12723). Sanitation team boarding at next scheduled junction required for replacement.',
        aiGeneratedDescription: 'Passenger Facility: Bio-toilet flush valve stuck open in Coach B3.',
        category: 'Passenger Facility Problem',
        department: {
          id: 'railway',
          code: 'RLY',
          name: 'Railway Department'
        },
        urgency: 'Medium',
        location: {
          address: 'Train 12723, Coach B3, Toilet #2 (Delhi Bound)',
          latitude: 17.5122,
          longitude: 78.5432
        },
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'Plumbing / Flush Defect', confidence: 0.91, bbox: [20, 20, 60, 60] }],
          confidence: 0.91,
          predictedCategory: 'Passenger Facility Problem',
          predictedUrgency: 'Medium',
          summary: 'On-board coach maintenance requirement.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'Closed',
        resolution: {
          notes: 'On-board housekeeping staff (OBHS) attended at Kazipet Junction. Solenoid valve replaced and floor sanitized.',
          resolvedAt: new Date(Date.now() - 40 * 3600 * 1000),
          officer: 'OBHS Supervisor (South Central Railway)'
        },
        verification: {
          isVerified: true,
          verifiedAt: new Date(Date.now() - 38 * 3600 * 1000),
          feedback: 'Attended quickly at Kazipet station. Clean and fixed.'
        },
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Grievance submitted by passenger.',
            officer: { name: 'System', department: 'Railway Department', role: 'Ingestion' },
            timestamp: new Date(Date.now() - 50 * 3600 * 1000)
          },
          {
            status: 'Resolved',
            message: 'OBHS team fixed valve at Kazipet Jn.',
            officer: { name: 'OBHS Supervisor', department: 'Railway Department', role: 'Field Tech' },
            timestamp: new Date(Date.now() - 40 * 3600 * 1000)
          },
          {
            status: 'Closed',
            message: 'Citizen confirmed resolution with 5-star rating.',
            officer: { name: 'Citizen Portal', department: 'Railway Department', role: 'Citizen' },
            timestamp: new Date(Date.now() - 38 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 50 * 3600 * 1000)
      },
      {
        complaintId: 'JNS-2026-000007',
        citizenId: String(citizen._id),
        citizenDetails: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        },
        description: 'Mosquito breeding and stagnant drain water accumulation behind Community Primary Health Centre, posing malaria risk to visiting patients.',
        generatedProblemStatement: 'Public Health Alert: Stagnant sewage water accumulation in open storm drain near Sector 9 PHC. Vector-borne disease risk requires immediate larvicide spraying and drain de-silting.',
        aiGeneratedDescription: 'Public Health Alert: Stagnant sewage water accumulation near Sector 9 PHC.',
        category: 'Health & Sanitation',
        department: {
          id: 'health_sanitation',
          code: 'HLT',
          name: 'Public Health & Sanitation'
        },
        urgency: 'Medium',
        location: {
          address: 'Sector 9 Primary Health Centre Rear Lane, Near Civil Hospital Gate 2',
          latitude: 17.4410,
          longitude: 78.5020
        },
        attachments: { images: [], videos: [], audio: [] },
        aiAnalysis: {
          detectedObjects: [{ label: 'Stagnant Drain Water / Vector Risk', confidence: 0.93, bbox: [15, 25, 70, 50] }],
          confidence: 0.93,
          predictedCategory: 'Health & Sanitation',
          predictedUrgency: 'Medium',
          summary: 'Vector-borne risk verified near healthcare facility.',
          modelVersion: 'JanSahayata-AI-Pipeline-v2.0'
        },
        status: 'Submitted',
        progressUpdates: [
          {
            status: 'Submitted',
            message: 'Grievance registered and routed to Public Health & Sanitation department.',
            officer: { name: 'JanSahayata Automated Router', department: 'Public Health & Sanitation', role: 'System' },
            timestamp: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 2 * 3600 * 1000)
      }
    ];

    const savedComplaints = await Complaint.create(complaintsData);
    console.log(`[Seed] Created ${savedComplaints.length} Realistic Multi-Department Complaints.`);

    // 5. Seed Audit Logs
    await AuditLog.create([
      {
        action: 'SYSTEM_INITIALIZED',
        performedBy: { userId: superAdmin._id, name: superAdmin.name, email: superAdmin.email, role: 'SUPER_ADMIN' },
        targetType: 'System',
        targetId: 'JanSahayata-Core',
        details: 'JanSahayata Enterprise Grievance Redressal Platform Initialized with Multi-Department routing.',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000)
      },
      {
        action: 'EMPLOYEE_CREATED',
        performedBy: { userId: superAdmin._id, name: superAdmin.name, email: superAdmin.email, role: 'SUPER_ADMIN' },
        targetType: 'User',
        targetId: String(employees[0]._id),
        details: `Super Admin created officer ${employees[0].name} (RLY-EMP-1001) in Railway Department.`,
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 60 * 3600 * 1000)
      },
      {
        action: 'COMPLAINT_SUBMITTED',
        performedBy: { userId: citizen._id, name: citizen.name, email: citizen.email, role: 'CITIZEN' },
        targetType: 'Complaint',
        targetId: 'JNS-2026-000001',
        details: 'Citizen submitted grievance JNS-2026-000001 (Pothole / Road Damage) routed to Railway Department.',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        action: 'STATUS_UPDATED',
        performedBy: { userId: employees[0]._id, name: employees[0].name, email: employees[0].email, role: 'EMPLOYEE' },
        targetType: 'Complaint',
        targetId: 'JNS-2026-000001',
        details: 'Officer K. Kiran Sai Karthik updated status of JNS-2026-000001 to In Progress.',
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000)
      }
    ]);
    console.log('[Seed] Created Initial Audit Logs.');

    console.log('\n========================================');
    console.log('✅ JanSahayata Seed Completed Successfully');
    console.log('========================================');
    console.log('Credentials Summary:');
    console.log('1. SUPER ADMIN:');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('2. GOVERNMENT EMPLOYEES:');
    console.log('   Railway Officer: officer.railway@jansahayata.gov.in / Officer@2026!');
    console.log('   Water Board Officer: officer.water@jansahayata.gov.in / Officer@2026!');
    console.log('   Municipal Officer: officer.muni@jansahayata.gov.in / Officer@2026!');
    console.log('   Roads (PWD) Officer: officer.roads@jansahayata.gov.in / Officer@2026!');
    console.log('3. CITIZEN:');
    console.log('   Email: citizen@jansahayata.gov.in / Citizen@2026!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
