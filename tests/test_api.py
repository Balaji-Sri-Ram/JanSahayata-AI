"""
Comprehensive test script for JanSahayata Django backend.
Tests all endpoints: Health, AI, Auth, Complaints, Staff, Admin, and Frontend rendering.
"""

import os
import sys
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jansahayata.settings')
django.setup()

from django.test import Client

client = Client()

def run_tests():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get('/api/health')
    print("Status:", res.status_code, "Data:", res.json())
    assert res.status_code == 200
    assert res.json()['status'] == 'online'
    assert res.json()['database'] == 'MongoDB'

    print("\n--- 2. Testing AI Departments Endpoint ---")
    res = client.get('/api/ai/departments')
    print("Status:", res.status_code, "Departments count:", len(res.json().get('data', [])))
    assert res.status_code == 200
    assert len(res.json()['data']) >= 8

    print("\n--- 3. Testing AI Preview Analysis ---")
    payload = {
        'description': 'Live wire hanging dangerously on main road sparking near transformer',
        'category': 'Broken Streetlight',
        'location': 'MG Road Pole 12'
    }
    res = client.post('/api/ai/preview-analysis', data=json.dumps(payload), content_type='application/json')
    print("Status:", res.status_code, "Analysis:", res.json().get('data', {}).get('summary'))
    assert res.status_code == 200
    assert 'structuredProblemStatement' in res.json()['data']

    print("\n--- 4. Testing Citizen Login ---")
    login_data = {
        'email': 'citizen@gmail.com',
        'password': 'Citizen@2026!'
    }
    res = client.post('/api/auth/login', data=json.dumps(login_data), content_type='application/json')
    print("Status:", res.status_code, "Citizen login success:", res.json().get('success'))
    assert res.status_code == 200
    citizen_token = res.json()['token']
    assert citizen_token is not None

    print("\n--- 5. Testing Officer Login ---")
    staff_login_data = {
        'email': 'officer.railway@jansahayata.gov.in',
        'password': 'Officer@2026!'
    }
    res = client.post('/api/auth/staff-login', data=json.dumps(staff_login_data), content_type='application/json')
    print("Status:", res.status_code, "Officer login success:", res.json().get('success'))
    assert res.status_code == 200
    staff_token = res.json()['token']
    assert staff_token is not None

    print("\n--- 6. Testing Super Admin Login ---")
    admin_login_data = {
        'email': 'admin@jansahayata.gov.in',
        'password': 'Admin@JanSahayata2026!'
    }
    res = client.post('/api/auth/staff-login', data=json.dumps(admin_login_data), content_type='application/json')
    print("Status:", res.status_code, "Admin login success:", res.json().get('success'))
    assert res.status_code == 200
    admin_token = res.json()['token']

    print("\n--- 7. Testing Complaint Submission (POST /api/complaints without slash) ---")
    complaint_payload = {
        'description': 'Broken platform seating with sharp metal edge near Coach S4',
        'category': 'Railway Infrastructure Damage',
        'departmentId': 'railway',
        'urgency': 'Medium',
        'locationAddress': 'Phagwara Railway Station Platform 2',
        'citizenName': 'Ravi Teja Sharma',
        'citizenEmail': 'citizen@gmail.com',
        'citizenPhone': '9848011223'
    }
    res = client.post('/api/complaints', data=complaint_payload, HTTP_AUTHORIZATION=f'Bearer {citizen_token}')
    print("Status:", res.status_code, "Submitted Complaint ID:", res.json().get('data', {}).get('complaintId'))
    assert res.status_code == 201
    assert res.json().get('success') is True

    print("\n--- 8. Testing Citizen Complaints List ---")
    res = client.get('/api/complaints/citizen/current', HTTP_AUTHORIZATION=f'Bearer {citizen_token}')
    print("Status:", res.status_code, "Citizen complaints count:", len(res.json().get('data', [])))
    assert res.status_code == 200
    assert len(res.json()['data']) >= 4

    print("\n--- 9. Testing Single Complaint Fetch ---")
    first_complaint_id = res.json()['data'][0]['complaintId']
    res = client.get(f'/api/complaints/{first_complaint_id}')
    print("Status:", res.status_code, "Fetched complaintId:", res.json().get('data', {}).get('complaintId'))
    assert res.status_code == 200
    assert res.json()['data']['complaintId'] == first_complaint_id

    print("\n--- 10. Testing Staff Dashboard Stats ---")
    res = client.get('/api/staff/dashboard/stats', HTTP_AUTHORIZATION=f'Bearer {staff_token}')
    print("Status:", res.status_code, "Staff stats total complaints:", res.json().get('data', {}).get('totalComplaints'))
    assert res.status_code == 200

    print("\n--- 11. Testing Super Admin Dashboard Stats ---")
    res = client.get('/api/admin/dashboard/stats', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    print("Status:", res.status_code, "Admin stats total complaints:", res.json().get('data', {}).get('totalComplaints'))
    assert res.status_code == 200

    print("\n--- 12. Testing Super Admin Employees List ---")
    res = client.get('/api/admin/employees', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    print("Status:", res.status_code, "Officers count:", len(res.json().get('data', [])))
    assert res.status_code == 200
    assert len(res.json()['data']) >= 5

    print("\n--- 13. Testing Frontend SPA Serving ---")
    res = client.get('/')
    print("Status:", res.status_code, "HTML content length:", len(res.content))
    assert res.status_code == 200
    assert b"JanSahayata" in res.content or b"root" in res.content

    print("\n=======================================================")
    print(" 🎉 ALL 13 INTEGRATION TESTS PASSED PERFECTLY!")
    print("=======================================================")

if __name__ == '__main__':
    run_tests()
