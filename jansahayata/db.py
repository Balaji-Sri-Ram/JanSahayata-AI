"""
MongoDB Database Connection & Security Helper (PyMongo)
Provides thread-safe access to collections and handles password hashing & JWT encoding.
"""

import os
from datetime import datetime, timezone
import bcrypt
import jwt
from bson import ObjectId
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017/grievance_platform')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'grievance_platform')
JWT_SECRET = os.getenv('JWT_SECRET', 'jansahayata_gov_secure_jwt_secret_key_2026_capstone_token')

_client = None
_db = None

def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _client

def get_db():
    global _db
    if _db is None:
        client = get_client()
        _db = client[MONGODB_DB_NAME]
    return _db

def get_users_collection():
    return get_db()['users']

def get_complaints_collection():
    return get_db()['complaints']

def get_audit_logs_collection():
    return get_db()['auditlogs']

def get_email_change_requests_collection():
    return get_db()['emailchangerequests']

def init_db_indexes():
    try:
        users = get_users_collection()
        users.create_index([('email', ASCENDING)], unique=True)
        users.create_index([('employeeId', ASCENDING)])
        
        complaints = get_complaints_collection()
        complaints.create_index([('complaintId', ASCENDING)], unique=True)
        complaints.create_index([('citizenId', ASCENDING)])
        complaints.create_index([('status', ASCENDING)])
        complaints.create_index([('department.id', ASCENDING)])
        
        print("[Database] MongoDB indexes initialized successfully.")
    except Exception as e:
        print(f"[Database Warning] Error creating indexes: {e}")

# ==========================================
# Security: Password Hashing & Verification
# ==========================================
def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(plain_password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

# ==========================================
# Security: JWT Token Generation & Decode
# ==========================================
def generate_jwt_token(user: dict) -> str:
    payload = {
        'userId': str(user.get('_id', '')),
        'email': user.get('email', ''),
        'role': user.get('role', 'CITIZEN'),
        'departmentId': (user.get('department') or {}).get('id')
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def decode_jwt_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

# ==========================================
# JSON Serialization Helper for MongoDB Docs
# ==========================================
def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        res = {}
        for k, v in doc.items():
            if k == '_id' and isinstance(v, ObjectId):
                res['_id'] = str(v)
                res['id'] = str(v)
            elif isinstance(v, ObjectId):
                res[k] = str(v)
            elif isinstance(v, datetime):
                res[k] = v.isoformat()
            elif isinstance(v, dict):
                res[k] = serialize_doc(v)
            elif isinstance(v, list):
                res[k] = serialize_doc(v)
            else:
                res[k] = v
        return res
    return doc

# ==========================================
# Helper: Generate Unique Complaint ID
# ==========================================
def generate_complaint_id(dept_code='JNS') -> str:
    complaints = get_complaints_collection()
    prefix = (dept_code or 'JNS').upper().strip()
    current_year = datetime.now().year
    count = complaints.count_documents({})
    seq = count + 1
    while True:
        candidate_id = f"{prefix}-{current_year}-{str(seq).zfill(6)}"
        if not complaints.find_one({'complaintId': candidate_id}):
            return candidate_id
        seq += 1

# ==========================================
# Helper: System Audit Logger
# ==========================================
def log_audit_action(action, performed_by=None, target_type='System', target_id='', details='', ip_address='127.0.0.1', metadata=None):
    try:
        logs = get_audit_logs_collection()
        performed_by_doc = {
            'userId': performed_by.get('_id') if performed_by else None,
            'name': performed_by.get('name', 'System') if performed_by else 'System',
            'email': performed_by.get('email', '') if performed_by else '',
            'role': performed_by.get('role', 'SYSTEM') if performed_by else 'SYSTEM'
        }
        log_entry = {
            'action': action,
            'performedBy': performed_by_doc,
            'targetType': target_type,
            'targetId': str(target_id),
            'details': details,
            'ipAddress': ip_address,
            'metadata': metadata or {},
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        }
        logs.insert_one(log_entry)
    except Exception as e:
        print(f"[AuditLog Error] Could not record log: {e}")

