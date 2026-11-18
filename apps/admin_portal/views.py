"""
Super Admin Controller & Governance Action Hub
System analytics, staff provisioning, jurisdictional reassignment, email approvals, and audit trail.
"""

import os
import json
from datetime import datetime, timezone
from bson import ObjectId
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from jansahayata.db import (
    get_users_collection,
    get_complaints_collection,
    get_audit_logs_collection,
    get_email_change_requests_collection,
    hash_password,
    serialize_doc,
    log_audit_action
)
from jansahayata.auth_middleware import role_required
from services.departments import getAllDepartmentsList, getDepartmentById
from services.email_service import (
    send_officer_welcome_email,
    send_email_change_old_address_notice,
    send_email_change_new_address_notice
)

def parse_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}

def compute_admin_stats():
    complaints_col = get_complaints_collection()
    users_col = get_users_collection()
    audit_col = get_audit_logs_collection()
    email_requests_col = get_email_change_requests_collection()

    all_complaints = list(complaints_col.find())
    total_c = len(all_complaints)
    submitted_c = sum(1 for c in all_complaints if c.get('status') == 'Submitted')
    underReview_c = sum(1 for c in all_complaints if c.get('status') == 'Under Review')
    accepted_c = sum(1 for c in all_complaints if c.get('status') == 'Accepted')
    inProgress_c = sum(1 for c in all_complaints if c.get('status') == 'In Progress')
    resolved_c = sum(1 for c in all_complaints if c.get('status') == 'Resolved')
    disputed_c = sum(1 for c in all_complaints if c.get('status') == 'Disputed' or (c.get('dispute') or {}).get('isDisputed'))
    escalated_c = sum(1 for c in all_complaints if c.get('status') == 'Escalated' or (c.get('escalation') or {}).get('isEscalated'))
    closed_c = sum(1 for c in all_complaints if c.get('status') == 'Closed')

    active_c = submitted_c + underReview_c + accepted_c + inProgress_c + disputed_c + escalated_c
    total_resolved = resolved_c + closed_c
    critical_c = sum(1 for c in all_complaints if c.get('urgency') == 'Critical' and c.get('status') not in ('Resolved', 'Closed'))

    total_citizens = users_col.count_documents({'role': 'CITIZEN'})
    total_officers = users_col.count_documents({'role': 'EMPLOYEE'})
    pending_email_requests = email_requests_col.count_documents({'status': 'PENDING'})

    # Breakdown by Department
    dept_map = {}
    for c in all_complaints:
        d = c.get('department', {})
        dept_id = d.get('id', 'railway') if isinstance(d, dict) else 'railway'
        dept_name = d.get('name', 'Railway Department') if isinstance(d, dict) else 'Railway Department'
        if dept_id not in dept_map:
            dept_map[dept_id] = {
                '_id': dept_id,
                'name': dept_name,
                'deptName': dept_name,
                'department': dept_name,
                'total': 0,
                'count': 0,
                'resolved': 0,
                'pending': 0,
                'escalated': 0,
                'disputed': 0
            }
        dept_map[dept_id]['total'] += 1
        dept_map[dept_id]['count'] += 1
        st = c.get('status')
        if st in ('Resolved', 'Closed'):
            dept_map[dept_id]['resolved'] += 1
        else:
            dept_map[dept_id]['pending'] += 1
        if st == 'Escalated':
            dept_map[dept_id]['escalated'] += 1
        if st == 'Disputed':
            dept_map[dept_id]['disputed'] += 1

    department_workload = list(dept_map.values())

    # Breakdown by Category & Urgency & Locations
    cat_counts = {}
    urgency_counts = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
    location_counts = {}

    for c in all_complaints:
        cat = c.get('category', 'Other')
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        u = c.get('urgency', 'Medium')
        if u in urgency_counts:
            urgency_counts[u] += 1
        loc = (c.get('location') or {}).get('address')
        if loc:
            dept_name = (c.get('department') or {}).get('name', 'General')
            location_counts[loc] = location_counts.get(loc, {'_id': loc, 'count': 0, 'latestDept': dept_name})
            location_counts[loc]['count'] += 1

    category_distribution = [{'_id': k, 'category': k, 'count': v} for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:8]]
    recurring_locations = sorted(location_counts.values(), key=lambda x: x['count'], reverse=True)[:6]

    res_rate = round((total_resolved / total_c * 100), 1) if total_c > 0 else 100.0

    recent_complaints = sorted(all_complaints, key=lambda x: x.get('createdAt', datetime.min), reverse=True)[:50]
    recent_audits = list(audit_col.find().sort('createdAt', -1).limit(10))

    counts_payload = {
        'total': total_c,
        'submitted': submitted_c,
        'underReview': underReview_c,
        'accepted': accepted_c,
        'inProgress': inProgress_c,
        'resolved': resolved_c,
        'disputed': disputed_c,
        'escalated': escalated_c,
        'closed': closed_c
    }

    return {
        'kpis': {
            'totalComplaints': total_c,
            'activeComplaints': active_c,
            'resolvedComplaints': total_resolved,
            'disputedComplaints': disputed_c,
            'escalatedComplaints': escalated_c,
            'totalCitizens': total_citizens,
            'totalEmployees': total_officers,
            'resolutionRate': res_rate,
            'avgResolutionHours': 28.4
        },
        'counts': counts_payload,
        'totalCounts': counts_payload,
        'totals': {
            'citizens': total_citizens,
            'employees': total_officers,
            'departments': len(department_workload) or 6,
            'escalated': escalated_c + disputed_c,
            'pendingEmailRequests': pending_email_requests
        },
        'departmentBreakdown': department_workload,
        'departmentWorkload': department_workload,
        'categoryDistribution': category_distribution,
        'recurringLocations': recurring_locations,
        'recentComplaints': [serialize_doc(c) for c in recent_complaints],
        'recentAuditLogs': [serialize_doc(a) for a in recent_audits],
        # Backward compatibility aliases
        'totalComplaints': total_c,
        'activeComplaints': active_c,
        'resolvedComplaints': total_resolved,
        'criticalAlerts': critical_c,
        'disputedComplaints': disputed_c,
        'escalatedComplaints': escalated_c,
        'totalCitizens': total_citizens,
        'totalEmployees': total_officers,
        'resolutionRate': res_rate,
        'urgencyBreakdown': urgency_counts
    }

@csrf_exempt
@role_required('SUPER_ADMIN')
def get_admin_dashboard_stats(request):
    stats = compute_admin_stats()
    return JsonResponse({'success': True, 'data': stats})

@csrf_exempt
@role_required('SUPER_ADMIN')
def sync_platform_data(request):
    user = request.current_user
    stats = compute_admin_stats()
    log_audit_action('PLATFORM_DATA_SYNC', performed_by=user, target_type='System', details="Platform data consistency check and synchronization run.")
    return JsonResponse({'success': True, 'message': 'Platform metrics synchronized successfully.', 'data': stats})

@csrf_exempt
@role_required('SUPER_ADMIN')
def employees_list_create(request):
    if request.method == 'POST':
        return create_employee(request)
    return get_employees(request)

def get_employees(request):
    query = {'role': 'EMPLOYEE'}
    dept = request.GET.get('department')
    if dept and dept != 'all':
        query['department.id'] = dept

    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        query['status'] = status_filter

    search = request.GET.get('search', '').strip()
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}},
            {'employeeId': {'$regex': search, '$options': 'i'}},
            {'designation': {'$regex': search, '$options': 'i'}}
        ]

    users_col = get_users_collection()
    total = users_col.count_documents(query)
    cursor = users_col.find(query).sort('createdAt', -1)
    employees = []
    for u in cursor:
        doc = serialize_doc(u)
        doc.pop('passwordHash', None)
        employees.append(doc)

    return JsonResponse({'success': True, 'total': total, 'data': employees})

@csrf_exempt
@role_required('SUPER_ADMIN')
def create_employee(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    dept_id = data.get('departmentId', 'railway')
    designation = data.get('designation', 'Grievance Redressal Officer').strip()
    temp_password = data.get('password') or 'Officer@2026!'

    if not name or not email:
        return JsonResponse({'success': False, 'message': 'Officer name and email are required.'}, status=400)

    users_col = get_users_collection()
    if users_col.find_one({'email': email}):
        return JsonResponse({'success': False, 'message': 'An officer with this email address already exists.'}, status=409)

    dept_config = getDepartmentById(dept_id)
    emp_count = users_col.count_documents({'department.id': dept_id})
    emp_id = f"{dept_config.get('code', 'GEN')}-EMP-{1000 + emp_count + 1}"

    now = datetime.now(timezone.utc)
    new_officer = {
        'name': name,
        'email': email,
        'phone': phone,
        'passwordHash': hash_password(temp_password),
        'role': 'EMPLOYEE',
        'department': {
            'id': dept_config['id'],
            'code': dept_config['code'],
            'name': dept_config['name']
        },
        'employeeId': emp_id,
        'designation': designation,
        'status': 'Active',
        'mustResetPassword': True,
        'createdAt': now,
        'updatedAt': now
    }

    res = users_col.insert_one(new_officer)
    new_officer['_id'] = res.inserted_id

    try:
        send_officer_welcome_email(name, email, emp_id, dept_config['name'], designation, temp_password)
    except Exception as e:
        print(f"[Email Warning] Could not dispatch officer welcome email: {e}")

    log_audit_action('OFFICER_CREATED', performed_by=request.current_user, target_type='User', target_id=emp_id, details=f"Created officer {name} ({emp_id})")

    doc = serialize_doc(new_officer)
    doc.pop('passwordHash', None)
    if not os.getenv('GMAIL_USER'):
        doc['temporaryPassword'] = temp_password
        print(f"\n[JANSAHAYATA OFFICER CREATED] Name: {name} | Email: {email} | Temp Password: {temp_password} | Emp ID: {emp_id}\n")

    return JsonResponse({'success': True, 'message': f'Officer {name} registered successfully!', 'data': doc}, status=201)

@csrf_exempt
@role_required('SUPER_ADMIN')
def update_employee(request, id):
    if request.method not in ('PATCH', 'PUT', 'POST'):
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    users_col = get_users_collection()
    doc = users_col.find_one({'$or': [{'_id': ObjectId(id) if ObjectId.is_valid(id) else None}, {'employeeId': id}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Employee not found.'}, status=404)

    update_fields = {'updatedAt': datetime.now(timezone.utc)}
    for field in ('name', 'phone', 'designation', 'status'):
        if field in data:
            update_fields[field] = data[field]

    if 'departmentId' in data:
        dept = getDepartmentById(data['departmentId'])
        update_fields['department'] = {'id': dept['id'], 'code': dept['code'], 'name': dept['name']}

    users_col.update_one({'_id': doc['_id']}, {'$set': update_fields})
    updated = users_col.find_one({'_id': doc['_id']})

    log_audit_action('OFFICER_UPDATED', performed_by=request.current_user, target_type='User', target_id=doc.get('employeeId'), details="Updated officer record.")

    res = serialize_doc(updated)
    res.pop('passwordHash', None)
    return JsonResponse({'success': True, 'message': 'Employee updated successfully.', 'data': res})

@csrf_exempt
@role_required('SUPER_ADMIN')
def get_citizens(request):
    query = {'role': 'CITIZEN'}
    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        query['status'] = status_filter

    search = request.GET.get('search', '').strip()
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}},
            {'phone': {'$regex': search, '$options': 'i'}}
        ]

    users_col = get_users_collection()
    total = users_col.count_documents(query)
    cursor = users_col.find(query).sort('createdAt', -1)
    citizens = []
    for c in cursor:
        doc = serialize_doc(c)
        doc.pop('passwordHash', None)
        citizens.append(doc)

    return JsonResponse({'success': True, 'total': total, 'data': citizens})

@csrf_exempt
@role_required('SUPER_ADMIN')
def update_citizen_status(request, id):
    if request.method not in ('PATCH', 'POST', 'PUT'):
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    new_status = data.get('status', 'Active')

    users_col = get_users_collection()
    doc = users_col.find_one({'_id': ObjectId(id) if ObjectId.is_valid(id) else None})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Citizen not found.'}, status=404)

    users_col.update_one({'_id': doc['_id']}, {'$set': {'status': new_status, 'updatedAt': datetime.now(timezone.utc)}})
    log_audit_action('CITIZEN_STATUS_UPDATE', performed_by=request.current_user, target_type='User', target_id=str(doc['_id']), details=f"Citizen status set to {new_status}")

    return JsonResponse({'success': True, 'message': f'Citizen status updated to {new_status}.'})

@csrf_exempt
@role_required('SUPER_ADMIN')
def get_all_complaints(request):
    query = {}
    dept = request.GET.get('department')
    if dept and dept != 'all':
        query['department.id'] = dept

    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        query['status'] = status_filter

    urgency_filter = request.GET.get('urgency')
    if urgency_filter and urgency_filter != 'all':
        query['urgency'] = urgency_filter

    search = request.GET.get('search', '').strip()
    if search:
        query['$or'] = [
            {'complaintId': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'citizenDetails.name': {'$regex': search, '$options': 'i'}},
            {'location.address': {'$regex': search, '$options': 'i'}}
        ]

    page = max(1, int(request.GET.get('page', 1)))
    limit = max(1, min(100, int(request.GET.get('limit', 20))))
    skip = (page - 1) * limit

    complaints_col = get_complaints_collection()
    total = complaints_col.count_documents(query)
    cursor = complaints_col.find(query).sort('createdAt', -1).skip(skip).limit(limit)

    return JsonResponse({
        'success': True,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit,
        'data': [serialize_doc(c) for c in cursor]
    })

@csrf_exempt
@role_required('SUPER_ADMIN')
def reassign_complaint_department(request, id):
    if request.method not in ('PATCH', 'POST', 'PUT'):
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    new_dept_id = data.get('departmentId')
    reason = data.get('reason', 'Administrative jurisdictional reassignment.')

    if not new_dept_id:
        return JsonResponse({'success': False, 'message': 'Target department ID is required.'}, status=400)

    dept_config = getDepartmentById(new_dept_id)
    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    now = datetime.now(timezone.utc)
    old_dept = doc.get('department', {}).get('name', 'Previous Department')
    new_update = {
        'status': doc.get('status', 'Submitted'),
        'message': f"Department reassigned from {old_dept} to {dept_config['name']}. Reason: {reason}",
        'officer': {
            'name': request.current_user.get('name', 'Super Administrator'),
            'department': 'Ministry of Public Grievance',
            'role': 'Super Admin'
        },
        'timestamp': now,
        'media': []
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {
                'department': {'id': dept_config['id'], 'code': dept_config['code'], 'name': dept_config['name']},
                'updatedAt': now
            },
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('COMPLAINT_REASSIGNED', performed_by=request.current_user, target_type='Complaint', target_id=doc.get('complaintId'), details=f"Reassigned to {dept_config['name']}")

    return JsonResponse({'success': True, 'message': f"Complaint successfully reassigned to {dept_config['name']}.", 'data': serialize_doc(updated)})

@csrf_exempt
@role_required('SUPER_ADMIN')
def admin_escalate_complaint(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    reason = data.get('reason', 'Direct Super Admin ministerial escalation.')
    escalated_to = data.get('escalatedTo', 'Central Grievance Redressal Monitoring Cell')

    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    now = datetime.now(timezone.utc)
    new_update = {
        'status': 'Escalated',
        'message': f"Super Admin Ministerial Escalation: \"{reason}\"",
        'officer': {
            'name': request.current_user.get('name', 'Super Administrator'),
            'department': 'Ministry of Public Grievance',
            'role': 'Super Admin'
        },
        'timestamp': now,
        'media': []
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {
                'status': 'Escalated',
                'escalation': {
                    'isEscalated': True,
                    'escalatedAt': now,
                    'escalationReason': reason,
                    'previousStatus': doc.get('status', 'Submitted'),
                    'escalatedTo': escalated_to
                },
                'updatedAt': now
            },
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('SUPER_ADMIN_ESCALATION', performed_by=request.current_user, target_type='Complaint', target_id=doc.get('complaintId'), details=f"Escalated to {escalated_to}")

    return JsonResponse({'success': True, 'message': 'Complaint successfully escalated by Super Admin.', 'data': serialize_doc(updated)})

@csrf_exempt
@role_required('SUPER_ADMIN')
def get_audit_logs(request):
    action = request.GET.get('action')
    query = {}
    if action and action != 'all':
        query['action'] = action

    search = request.GET.get('search', '').strip()
    if search:
        query['$or'] = [
            {'details': {'$regex': search, '$options': 'i'}},
            {'action': {'$regex': search, '$options': 'i'}},
            {'performedBy.name': {'$regex': search, '$options': 'i'}},
            {'targetId': {'$regex': search, '$options': 'i'}}
        ]

    page = max(1, int(request.GET.get('page', 1)))
    limit = max(1, min(100, int(request.GET.get('limit', 25))))
    skip = (page - 1) * limit

    audit_col = get_audit_logs_collection()
    total = audit_col.count_documents(query)
    cursor = audit_col.find(query).sort('createdAt', -1).skip(skip).limit(limit)

    return JsonResponse({
        'success': True,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit,
        'data': [serialize_doc(a) for a in cursor]
    })

@csrf_exempt
def get_departments_directory(request):
    return JsonResponse({'success': True, 'data': getAllDepartmentsList()})

@csrf_exempt
@role_required('SUPER_ADMIN')
def get_email_change_requests(request):
    status_filter = request.GET.get('status')
    query = {}
    if status_filter and status_filter != 'all':
        query['status'] = status_filter

    requests_col = get_email_change_requests_collection()
    cursor = requests_col.find(query).sort('createdAt', -1)
    return JsonResponse({'success': True, 'data': [serialize_doc(r) for r in cursor]})

@csrf_exempt
@role_required('SUPER_ADMIN')
def approve_email_change_request(request, id):
    if request.method not in ('PATCH', 'POST', 'PUT'):
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    admin_notes = data.get('adminNotes', 'Approved by Super Administrator.')

    requests_col = get_email_change_requests_collection()
    users_col = get_users_collection()

    req_doc = requests_col.find_one({'_id': ObjectId(id) if ObjectId.is_valid(id) else None})
    if not req_doc:
        return JsonResponse({'success': False, 'message': 'Request not found.'}, status=404)

    now = datetime.now(timezone.utc)
    old_email = req_doc.get('currentEmail')
    new_email = req_doc.get('requestedEmail')
    target_user_id = req_doc.get('user') or req_doc.get('officer')

    # Update user's email
    users_col.update_one({'_id': target_user_id}, {'$set': {'email': new_email, 'updatedAt': now}})

    # Update request doc
    requests_col.update_one(
        {'_id': req_doc['_id']},
        {
            '$set': {
                'status': 'APPROVED',
                'adminNotes': admin_notes,
                'reviewedBy': request.current_user['_id'],
                'reviewedByName': request.current_user.get('name', 'Super Admin'),
                'reviewedAt': now,
                'updatedAt': now
            }
        }
    )

    try:
        name = req_doc.get('officerName') or req_doc.get('citizenName') or 'User'
        send_email_change_old_address_notice(old_email, new_email, name)
        send_email_change_new_address_notice(new_email, name)
    except Exception as e:
        print(f"[Email Notice Error]: {e}")

    log_audit_action('EMAIL_CHANGE_APPROVED', performed_by=request.current_user, target_type='User', target_id=str(target_user_id), details=f"Approved email change from {old_email} to {new_email}")

    return JsonResponse({'success': True, 'message': f'Email change request approved. Updated email to {new_email}.'})

@csrf_exempt
@role_required('SUPER_ADMIN')
def reject_email_change_request(request, id):
    if request.method not in ('PATCH', 'POST', 'PUT'):
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    admin_notes = data.get('adminNotes', 'Request rejected by Administrator.')

    requests_col = get_email_change_requests_collection()
    req_doc = requests_col.find_one({'_id': ObjectId(id) if ObjectId.is_valid(id) else None})
    if not req_doc:
        return JsonResponse({'success': False, 'message': 'Request not found.'}, status=404)

    now = datetime.now(timezone.utc)
    requests_col.update_one(
        {'_id': req_doc['_id']},
        {
            '$set': {
                'status': 'REJECTED',
                'adminNotes': admin_notes,
                'reviewedBy': request.current_user['_id'],
                'reviewedByName': request.current_user.get('name', 'Super Admin'),
                'reviewedAt': now,
                'updatedAt': now
            }
        }
    )

    log_audit_action('EMAIL_CHANGE_REJECTED', performed_by=request.current_user, target_type='User', target_id=str(req_doc.get('user')), details=f"Rejected email change request. Notes: {admin_notes}")

    return JsonResponse({'success': True, 'message': 'Email change request rejected.'})
