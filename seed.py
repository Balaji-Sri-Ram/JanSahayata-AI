"""
Database Seeder for JanSahayata AI (Django & MongoDB)
Seeds Super Admin, Department Grievance Officers, Citizens, and realistic Grievance Complaints.
"""

import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

from jansahayata.db import (
    get_users_collection,
    get_complaints_collection,
    get_audit_logs_collection,
    get_email_change_requests_collection,
    hash_password,
    init_db_indexes
)

def run_seed():
    print("[Seed] Initializing MongoDB connection...")
    init_db_indexes()

    users_col = get_users_collection()
    complaints_col = get_complaints_collection()
    audit_col = get_audit_logs_collection()
    requests_col = get_email_change_requests_collection()

    # Clear collections
    users_col.delete_many({})
    complaints_col.delete_many({})
    audit_col.delete_many({})
    requests_col.delete_many({})
    print("[Seed] Cleared existing User, Complaint, and Audit collections.")

    now = datetime.now(timezone.utc)

    # 1. Super Admin
    admin_pass = os.getenv('SUPER_ADMIN_PASSWORD', 'Admin@JanSahayata2026!')
    admin_user = {
        'name': 'Phaniswar',
        'email': os.getenv('SUPER_ADMIN_EMAIL', 'admin@jansahayata.gov.in').lower(),
        'phone': '+91 94150 11223',
        'passwordHash': hash_password(admin_pass),
        'role': 'SUPER_ADMIN',
        'department': {
            'id': 'governance',
            'code': 'GOV',
            'name': 'Ministry of Public Grievance & Administrative Reforms'
        },
        'employeeId': 'DIR-ADM-0001',
        'designation': 'Principal Secretary / Chief Administrative Director',
        'status': 'Active',
        'mustResetPassword': False,
        'createdAt': now,
        'updatedAt': now
    }
    admin_res = users_col.insert_one(admin_user)
    admin_id = admin_res.inserted_id
    print(f"[Seed] Created Super Admin: {admin_user['email']}")

    # 2. Government Officers
    officer_pass = hash_password('Officer@2026!')
    officers = [
        {
            'name': 'K. Kiran Sai Karthik',
            'email': 'officer.railway@jansahayata.gov.in',
            'phone': '+91 98480 22334',
            'passwordHash': officer_pass,
            'role': 'EMPLOYEE',
            'department': {
                'id': 'railway',
                'code': 'RLY',
                'name': 'Railway Department'
            },
            'employeeId': 'RLY-EMP-1001',
            'designation': 'Station Superintendent / Zonal Grievance Officer',
            'status': 'Active',
            'mustResetPassword': False,
            'createdAt': now,
            'updatedAt': now
        },
        {
            'name': 'P. Balaji Sri Ram',
            'email': 'officer.water@jansahayata.gov.in',
            'phone': '+91 97230 44556',
            'passwordHash': officer_pass,
            'role': 'EMPLOYEE',
            'department': {
                'id': 'water_supply',
                'code': 'WTR',
                'name': 'Water Supply & Sewerage Board'
            },
            'employeeId': 'WTR-EMP-2001',
            'designation': 'Assistant Executive Engineer (Water Works)',
            'status': 'Active',
            'mustResetPassword': False,
            'createdAt': now,
            'updatedAt': now
        },
        {
            'name': 'P. Balu Lakshman Pavan',
            'email': 'officer.muni@jansahayata.gov.in',
            'phone': '+91 96120 77889',
            'passwordHash': officer_pass,
            'role': 'EMPLOYEE',
            'department': {
                'id': 'municipality',
                'code': 'MUN',
                'name': 'Municipal Corporation'
            },
            'employeeId': 'MUN-EMP-3001',
            'designation': 'Chief Sanitary Inspector (Zone 4)',
            'status': 'Active',
            'mustResetPassword': False,
            'createdAt': now,
            'updatedAt': now
        },
        {
            'name': 'K. Pavan Kalyan',
            'email': 'officer.roads@jansahayata.gov.in',
            'phone': '+91 95010 33445',
            'passwordHash': officer_pass,
            'role': 'EMPLOYEE',
            'department': {
                'id': 'roads_infra',
                'code': 'RDS',
                'name': 'Roads & Infrastructure (PWD)'
            },
            'employeeId': 'RDS-EMP-4001',
            'designation': 'Assistant Engineer (Civil Infrastructure)',
            'status': 'Active',
            'mustResetPassword': False,
            'createdAt': now,
            'updatedAt': now
        },
        {
            'name': 'Allada Pavan',
            'email': 'officer.electricity@jansahayata.gov.in',
            'phone': '+91 94400 55667',
            'passwordHash': officer_pass,
            'role': 'EMPLOYEE',
            'department': {
                'id': 'electricity',
                'code': 'ELE',
                'name': 'Electricity Board (DISCOM)'
            },
            'employeeId': 'ELE-EMP-5001',
            'designation': 'Assistant Divisional Engineer (Power & Distribution)',
            'status': 'Active',
            'mustResetPassword': False,
            'createdAt': now,
            'updatedAt': now
        }
    ]
    users_col.insert_many(officers)
    print(f"[Seed] Created {len(officers)} Department Grievance Officers.")

    # 3. Citizen Account
    citizen_user = {
        'name': 'Ravi Teja Sharma',
        'email': 'citizen@gmail.com',
        'phone': '+91 98765 43210',
        'passwordHash': hash_password('Citizen@2026!'),
        'role': 'CITIZEN',
        'status': 'Active',
        'createdAt': now,
        'updatedAt': now
    }
    citizen_res = users_col.insert_one(citizen_user)
    citizen_id = str(citizen_res.inserted_id)
    print(f"[Seed] Created Demo Citizen: {citizen_user['email']}")

    # 4. Realistic Grievance Complaints
    complaints = [
        {
            'complaintId': 'JNS-2026-000001',
            'citizenId': citizen_id,
            'citizenDetails': {
                'name': citizen_user['name'],
                'email': citizen_user['email'],
                'phone': citizen_user['phone']
            },
            'description': 'There is a deep pothole and cracked stone pavement near platform 2 close to the central tea kiosk, creating a severe tripping hazard for boarding passengers carrying heavy luggage.',
            'generatedProblemStatement': 'Formal Grievance: Damaged pavement and hazardous pothole detected at Platform 2 (North Section). High pedestrian footfall during peak train boarding hours requires urgent masonry and asphalt leveling.',
            'aiGeneratedDescription': 'Formal Grievance: Damaged pavement and hazardous pothole detected at Platform 2 (North Section).',
            'category': 'Pothole / Road Damage',
            'department': {
                'id': 'railway',
                'code': 'RLY',
                'name': 'Railway Department'
            },
            'urgency': 'High',
            'location': {
                'address': 'Secunderabad Junction - Platform 2, North Gate near Coach S4 position',
                'latitude': 17.4344,
                'longitude': 78.5015
            },
            'attachments': {'images': [], 'videos': [], 'audio': []},
            'evidence': [],
            'aiAnalysis': {
                'detectedObjects': [{'label': 'Damaged Pavement / Pothole', 'confidence': 0.94, 'bbox': [22, 35, 54, 42]}],
                'confidence': 0.94,
                'predictedCategory': 'Pothole / Road Damage',
                'predictedUrgency': 'High',
                'summary': 'Image analysis identified high probability (94%) of pavement structural hazard.',
                'modelVersion': 'JanSahayata-AI-Pipeline-v2.0'
            },
            'status': 'In Progress',
            'progressUpdates': [
                {
                    'status': 'Submitted',
                    'message': 'Grievance submitted by citizen and routed automatically to Railway Department.',
                    'officer': {'name': 'JanSahayata System', 'department': 'Railway Department', 'role': 'Automated Dispatch'},
                    'timestamp': now - timedelta(hours=36),
                    'media': []
                },
                {
                    'status': 'Under Review',
                    'message': 'Grievance reviewed by Platform Superintendent. Forwarded to Civil Engineering Team.',
                    'officer': {'name': 'K. Kiran Sai Karthik', 'department': 'Railway Department', 'role': 'Station Superintendent'},
                    'timestamp': now - timedelta(hours=24),
                    'media': []
                },
                {
                    'status': 'In Progress',
                    'message': 'Civil repair crew deployed on Platform 2 with quick-setting polymer concrete mix.',
                    'officer': {'name': 'M. S. Ananth', 'department': 'Railway Department', 'role': 'Senior Section Engineer'},
                    'timestamp': now - timedelta(hours=6),
                    'media': []
                }
            ],
            'createdAt': now - timedelta(hours=36),
            'updatedAt': now - timedelta(hours=6)
        },
        {
            'complaintId': 'JNS-2026-000002',
            'citizenId': citizen_id,
            'citizenDetails': {
                'name': citizen_user['name'],
                'email': citizen_user['email'],
                'phone': citizen_user['phone']
            },
            'description': 'Main drinking water pipeline has burst near the community market area, resulting in heavy water loss and low pressure across 200 residential households since morning.',
            'generatedProblemStatement': 'Civic Alert: Potable water main distribution line breach near Sector 4 Community Market. Urgent valve isolation and pipe coupling replacement required to restore household supply.',
            'aiGeneratedDescription': 'Civic Alert: Potable water main distribution line breach near Sector 4 Community Market.',
            'category': 'Water Leakage',
            'department': {
                'id': 'water_supply',
                'code': 'WTR',
                'name': 'Water Supply & Sewerage Board'
            },
            'urgency': 'Critical',
            'location': {
                'address': 'Sector 4 Community Market Main Road, Near Water Tank 3',
                'latitude': 17.4421,
                'longitude': 78.4982
            },
            'attachments': {'images': [], 'videos': [], 'audio': []},
            'evidence': [],
            'aiAnalysis': {
                'detectedObjects': [{'label': 'High-Pressure Water Burst', 'confidence': 0.96, 'bbox': [15, 20, 70, 60]}],
                'confidence': 0.96,
                'predictedCategory': 'Water Leakage',
                'predictedUrgency': 'Critical',
                'summary': 'High-volume potable water wastage verified.',
                'modelVersion': 'JanSahayata-AI-Pipeline-v2.0'
            },
            'status': 'Under Review',
            'progressUpdates': [
                {
                    'status': 'Submitted',
                    'message': 'Grievance submitted with Critical priority tag.',
                    'officer': {'name': 'JanSahayata Ingestion', 'department': 'Water Supply & Sewerage Board', 'role': 'System'},
                    'timestamp': now - timedelta(hours=4),
                    'media': []
                },
                {
                    'status': 'Under Review',
                    'message': 'Emergency repair squad alerted. Sluice valve isolated to prevent further flooding.',
                    'officer': {'name': 'P. Balaji Sri Ram', 'department': 'Water Supply & Sewerage Board', 'role': 'Assistant Executive Engineer'},
                    'timestamp': now - timedelta(hours=1),
                    'media': []
                }
            ],
            'createdAt': now - timedelta(hours=4),
            'updatedAt': now - timedelta(hours=1)
        },
        {
            'complaintId': 'JNS-2026-000003',
            'citizenId': citizen_id,
            'citizenDetails': {
                'name': citizen_user['name'],
                'email': citizen_user['email'],
                'phone': citizen_user['phone']
            },
            'description': 'Large garbage heap accumulating outside the municipal primary school gate. Stray animals are gathering and scattering waste onto the walkway.',
            'generatedProblemStatement': 'Public Sanitation: Solid waste dumping near Municipal Primary School Gate (Ward 12). Poses health and vector safety hazard to school children. Immediate compactor truck deployment needed.',
            'aiGeneratedDescription': 'Public Sanitation: Solid waste dumping near Municipal Primary School Gate.',
            'category': 'Garbage / Waste',
            'department': {
                'id': 'municipality',
                'code': 'MUN',
                'name': 'Municipal Corporation'
            },
            'urgency': 'High',
            'location': {
                'address': 'Ward 12, Municipal Primary School Lane, Gandhi Nagar',
                'latitude': 17.4298,
                'longitude': 78.5088
            },
            'attachments': {'images': [], 'videos': [], 'audio': []},
            'evidence': [],
            'aiAnalysis': {
                'detectedObjects': [{'label': 'Solid Waste / Garbage Pile', 'confidence': 0.92, 'bbox': [20, 30, 60, 50]}],
                'confidence': 0.92,
                'predictedCategory': 'Garbage / Waste',
                'predictedUrgency': 'High',
                'summary': 'Garbage pile detected within 50 meters of educational institution.',
                'modelVersion': 'JanSahayata-AI-Pipeline-v2.0'
            },
            'status': 'Resolved',
            'resolution': {
                'notes': 'Sanitation team deployed mechanical compactor truck. Cleared 1.8 metric tons of waste and disinfected the school perimeter with bleaching powder.',
                'resolvedAt': now - timedelta(hours=5),
                'officer': 'P. Balu Lakshman Pavan (Chief Sanitary Inspector)',
                'media': []
            },
            'progressUpdates': [
                {
                    'status': 'Submitted',
                    'message': 'Complaint submitted by citizen.',
                    'officer': {'name': 'System', 'department': 'Municipal Corporation', 'role': 'Automated Dispatch'},
                    'timestamp': now - timedelta(hours=28),
                    'media': []
                },
                {
                    'status': 'In Progress',
                    'message': 'Sanitation vehicle assigned to Ward 12 route.',
                    'officer': {'name': 'P. Balu Lakshman Pavan', 'department': 'Municipal Corporation', 'role': 'Chief Sanitary Inspector'},
                    'timestamp': now - timedelta(hours=12),
                    'media': []
                },
                {
                    'status': 'Resolved',
                    'message': 'Waste removed completely and area disinfected. Awaiting citizen resolution verification.',
                    'officer': {'name': 'P. Balu Lakshman Pavan', 'department': 'Municipal Corporation', 'role': 'Chief Sanitary Inspector'},
                    'timestamp': now - timedelta(hours=5),
                    'media': []
                }
            ],
            'createdAt': now - timedelta(hours=28),
            'updatedAt': now - timedelta(hours=5)
        },
        {
            'complaintId': 'JNS-2026-000004',
            'citizenId': citizen_id,
            'citizenDetails': {
                'name': citizen_user['name'],
                'email': citizen_user['email'],
                'phone': citizen_user['phone']
            },
            'description': 'Road cave-in and broken drainage culvert on State Highway link road creating heavy traffic jam and risk of two-wheeler accidents.',
            'generatedProblemStatement': 'Road Infrastructure: Structural culvert collapse on Highway Link Road. PWD emergency barricading and slab reconstruction required.',
            'aiGeneratedDescription': 'Road Infrastructure: Structural culvert collapse on Highway Link Road.',
            'category': 'Pothole / Road Damage',
            'department': {
                'id': 'roads_infra',
                'code': 'RDS',
                'name': 'Roads & Infrastructure (PWD)'
            },
            'urgency': 'Critical',
            'location': {
                'address': 'State Highway Link Road, KM 14 Marker near Ring Road Flyover',
                'latitude': 17.4112,
                'longitude': 78.4721
            },
            'attachments': {'images': [], 'videos': [], 'audio': []},
            'evidence': [],
            'aiAnalysis': {
                'detectedObjects': [{'label': 'Culvert Collapse / Cave-in', 'confidence': 0.95, 'bbox': [25, 20, 50, 60]}],
                'confidence': 0.95,
                'predictedCategory': 'Pothole / Road Damage',
                'predictedUrgency': 'Critical',
                'summary': 'Severe road surface failure on high-speed corridor.',
                'modelVersion': 'JanSahayata-AI-Pipeline-v2.0'
            },
            'status': 'Disputed',
            'dispute': {
                'isDisputed': True,
                'reason': 'Officer marked resolved previously, but only temporary mud was dumped into the pit which washed away in light rain. Deep hole is still exposed.',
                'createdAt': now - timedelta(hours=8),
                'media': []
            },
            'progressUpdates': [
                {
                    'status': 'Submitted',
                    'message': 'Grievance submitted by citizen.',
                    'officer': {'name': 'System', 'department': 'Roads & Infrastructure (PWD)', 'role': 'Ingestion'},
                    'timestamp': now - timedelta(hours=48),
                    'media': []
                },
                {
                    'status': 'Resolved',
                    'message': 'Temporary patching completed by local gang.',
                    'officer': {'name': 'K. Pavan Kalyan', 'department': 'Roads & Infrastructure (PWD)', 'role': 'Assistant Engineer'},
                    'timestamp': now - timedelta(hours=16),
                    'media': []
                },
                {
                    'status': 'Disputed',
                    'message': 'Citizen disputed resolution: Mud filling washed away; permanent RCC pre-cast slab repair required. Reopened for engineer reinspection.',
                    'officer': {'name': 'Citizen Dispute Portal', 'department': 'Roads & Infrastructure (PWD)', 'role': 'Citizen'},
                    'timestamp': now - timedelta(hours=8),
                    'media': []
                }
            ],
            'createdAt': now - timedelta(hours=48),
            'updatedAt': now - timedelta(hours=8)
        },
        {
            'complaintId': 'JNS-2026-000005',
            'citizenId': 'CITIZEN-DEMO-001',
            'citizenDetails': {
                'name': 'Priya Nambiar',
                'email': 'priya.n@example.com',
                'phone': '+91 94451 88990'
            },
            'description': 'Dangling high-voltage electricity cable hanging within reach of pedestrians on Park Avenue sidewalk near Electric Transformer 14.',
            'generatedProblemStatement': 'Public Safety Hazard: Exposed live overhead electricity conductor sagging 1.5m above pedestrian walkway. Urgent line de-energization and insulator replacement mandated.',
            'aiGeneratedDescription': 'Public Safety Hazard: Exposed live overhead electricity conductor sagging 1.5m above pedestrian walkway.',
            'category': 'Broken Streetlight',
            'department': {
                'id': 'electricity',
                'code': 'ELE',
                'name': 'Electricity Board (DISCOM)'
            },
            'urgency': 'Critical',
            'location': {
                'address': 'Park Avenue Sidewalk, Opp. Central Post Office, Near Pole #E-442',
                'latitude': 17.4378,
                'longitude': 78.4891
            },
            'attachments': {'images': [], 'videos': [], 'audio': []},
            'evidence': [],
            'aiAnalysis': {
                'detectedObjects': [{'label': 'Dangling Electrical Cable', 'confidence': 0.98, 'bbox': [30, 10, 40, 80]}],
                'confidence': 0.98,
                'predictedCategory': 'Broken Streetlight',
                'predictedUrgency': 'Critical',
                'summary': 'Severe life-safety shock hazard detected.',
                'modelVersion': 'JanSahayata-AI-Pipeline-v2.0'
            },
            'status': 'Escalated',
            'escalation': {
                'isEscalated': True,
                'escalatedAt': now - timedelta(hours=2),
                'escalationReason': 'Immediate life safety hazard to pedestrians. Escalated to Chief Electrical Inspectorate.',
                'previousStatus': 'Under Review',
                'escalatedTo': 'Chief Electrical Safety Cell'
            },
            'progressUpdates': [
                {
                    'status': 'Submitted',
                    'message': 'Grievance submitted with Critical status flag.',
                    'officer': {'name': 'System', 'department': 'Electricity Board (DISCOM)', 'role': 'Dispatcher'},
                    'timestamp': now - timedelta(hours=14),
                    'media': []
                },
                {
                    'status': 'Escalated',
                    'message': 'Officer escalated case: Transformer feeder circuit trip hazard. Line inspection gang deployed under emergency protocol.',
                    'officer': {'name': 'Allada Pavan', 'department': 'Electricity Board (DISCOM)', 'role': 'Assistant Divisional Engineer'},
                    'timestamp': now - timedelta(hours=2),
                    'media': []
                }
            ],
            'createdAt': now - timedelta(hours=14),
            'updatedAt': now - timedelta(hours=2)
        }
    ]
    complaints_col.insert_many(complaints)
    print(f"[Seed] Created {len(complaints)} Realistic Grievance Complaints.")

    # 5. Audit Trail Logs
    audits = [
        {
            'action': 'SYSTEM_SEED',
            'performedBy': {'name': 'System Seeder', 'email': 'admin@jansahayata.gov.in', 'role': 'SYSTEM'},
            'targetType': 'System',
            'targetId': 'INIT-001',
            'details': 'Initialized official departments and demo data for JanSahayata AI.',
            'ipAddress': '127.0.0.1',
            'metadata': {'version': '2.0.0-django'},
            'createdAt': now,
            'updatedAt': now
        },
        {
            'action': 'OFFICER_LOGIN',
            'performedBy': {'name': 'K. Kiran Sai Karthik', 'email': 'officer.railway@jansahayata.gov.in', 'role': 'EMPLOYEE'},
            'targetType': 'Authentication',
            'targetId': 'RLY-EMP-1001',
            'details': 'Officer authenticated successfully to Railway Department Dashboard.',
            'ipAddress': '127.0.0.1',
            'metadata': {},
            'createdAt': now - timedelta(hours=1),
            'updatedAt': now - timedelta(hours=1)
        }
    ]
    audit_col.insert_many(audits)
    print(f"[Seed] Created {len(audits)} Initial Audit Logs.")

    print("\n=======================================================")
    print(" ✅ JanSahayata AI Database Seed Completed Successfully!")
    print("=======================================================")
    print(f" Super Admin: {admin_user['email']} / {admin_pass}")
    print(f" Railway Officer: officer.railway@jansahayata.gov.in / Officer@2026!")
    print(f" Citizen Account: {citizen_user['email']} / Citizen@2026!")
    print("=======================================================\n")

if __name__ == '__main__':
    run_seed()

