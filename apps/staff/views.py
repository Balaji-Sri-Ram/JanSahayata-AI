"""
Government Staff & Officer Grievance Management Controller
Department officer dashboards, status updates, field proofs, and resolution workflows.
"""

import json
import re
from datetime import datetime, timezone
from bson import ObjectId
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from jansahayata.db import (
    get_complaints_collection,
    get_email_change_requests_collection,
    serialize_doc,
    log_audit_action
)
from jansahayata.auth_middleware import role_required
from apps.complaints.views import save_uploaded_file
from services.departments import getDepartmentById

def parse_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}

def get_officer_dept_id(user):
    if user.get('role') == 'SUPER_ADMIN':
        return None  # Super admin sees all or can filter
    dept = user.get('department') or {}
    return dept.get('id', 'railway')

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def get_staff_dashboard_stats(request):
    user = request.current_user
    dept_id = get_officer_dept_id(user)

    query = {}
    if dept_id:
        query['department.id'] = dept_id

    complaints_col = get_complaints_collection()
    all_complaints = list(complaints_col.find(query))

    total = len(all_complaints)
    submitted = sum(1 for c in all_complaints if c.get('status') == 'Submitted')
    underReview = sum(1 for c in all_complaints if c.get('status') == 'Under Review')
    accepted = sum(1 for c in all_complaints if c.get('status') == 'Accepted')
    inProgress = sum(1 for c in all_complaints if c.get('status') == 'In Progress')
    resolved = sum(1 for c in all_complaints if c.get('status') == 'Resolved')
    disputed = sum(1 for c in all_complaints if c.get('status') == 'Disputed' or (c.get('dispute') or {}).get('isDisputed'))
    escalated = sum(1 for c in all_complaints if c.get('status') == 'Escalated' or (c.get('escalation') or {}).get('isEscalated'))
    closed = sum(1 for c in all_complaints if c.get('status') == 'Closed')
    urgentCritical = sum(1 for c in all_complaints if c.get('urgency') in ('High', 'Critical') and c.get('status') not in ('Resolved', 'Closed'))

    active = submitted + underReview + accepted + inProgress
    total_resolved = resolved + closed

    cat_counts = {}
    urgency_counts = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}

    for c in all_complaints:
        cat = c.get('category', 'Other')
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        u = c.get('urgency', 'Medium')
        if u in urgency_counts:
            urgency_counts[u] += 1

    recent = sorted(all_complaints, key=lambda x: x.get('createdAt', datetime.min), reverse=True)[:6]

    dept_info = getDepartmentById(dept_id) if dept_id else (user.get('department') or {'id': '', 'name': 'General Directorate', 'code': 'GEN'})

    counts_payload = {
        'total': total,
        'submitted': submitted,
        'underReview': underReview,
        'accepted': accepted,
        'inProgress': inProgress,
        'resolved': resolved,
        'disputed': disputed,
        'escalated': escalated,
        'closed': closed,
        'urgentCritical': urgentCritical
    }

    return JsonResponse({
        'success': True,
        'data': {
            'department': {
                'id': dept_info.get('id', ''),
                'name': dept_info.get('name', 'Department'),
                'code': dept_info.get('code', 'DEPT'),
                'authority': dept_info.get('authority', '')
            },
            'counts': counts_payload,
            'categoryStats': [{'_id': k, 'category': k, 'count': v} for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)],
            'urgencyBreakdown': urgency_counts,
            'recentComplaints': [serialize_doc(c) for c in recent],
            # Backward compatibility aliases
            'totalComplaints': total,
            'activeComplaints': active,
            'resolvedComplaints': total_resolved,
            'criticalAlerts': urgentCritical,
            'disputedComplaints': disputed,
            'escalatedComplaints': escalated,
            'categories': [{'category': k, 'count': v} for k, v in cat_counts.items()]
        }
    })

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def get_staff_complaints(request):
    user = request.current_user
    dept_id = get_officer_dept_id(user)

    query = {}
    if dept_id:
        query['department.id'] = dept_id

    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        query['status'] = status_filter

    urgency_filter = request.GET.get('urgency')
    if urgency_filter and urgency_filter != 'all':
        query['urgency'] = urgency_filter

    category_filter = request.GET.get('category')
    if category_filter and category_filter != 'all':
        query['category'] = category_filter

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

    complaints = [serialize_doc(c) for c in cursor]

    return JsonResponse({
        'success': True,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit,
        'data': complaints
    })

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def get_staff_complaint_by_id(request, id):
    complaints_col = get_complaints_collection()
    doc = None
    if ObjectId.is_valid(id):
        doc = complaints_col.find_one({'_id': ObjectId(id)})
    if not doc:
        doc = complaints_col.find_one({'complaintId': id})

    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    return JsonResponse({'success': True, 'data': serialize_doc(doc)})

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def update_staff_status(request, id):
    if request.method not in ('PATCH', 'POST', 'PUT'):
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    new_status = data.get('status')
    notes = data.get('notes', f"Status updated to {new_status}")

    valid_statuses = ['Submitted', 'Under Review', 'Accepted', 'In Progress', 'Resolved', 'Disputed', 'Escalated', 'Closed']
    if new_status not in valid_statuses:
        return JsonResponse({'success': False, 'message': f'Invalid status: {new_status}'}, status=400)

    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    user = request.current_user
    now = datetime.now(timezone.utc)
    new_update = {
        'status': new_status,
        'message': notes,
        'officer': {
            'name': user.get('name', 'Department Officer'),
            'department': (user.get('department') or {}).get('name', 'Public Department'),
            'role': user.get('designation', 'Grievance Redressal Officer')
        },
        'timestamp': now,
        'media': []
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {'status': new_status, 'updatedAt': now},
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('STATUS_UPDATE', performed_by=user, target_type='Complaint', target_id=doc.get('complaintId'), details=f"Status updated to {new_status}")

    return JsonResponse({'success': True, 'message': f"Grievance status updated to {new_status}", 'data': serialize_doc(updated)})

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def add_staff_progress_update(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = request.POST.dict() if request.POST else {}
    if not data and request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            pass

    message = data.get('message', '').strip()
    status_val = data.get('status', 'In Progress')

    if not message:
        return JsonResponse({'success': False, 'message': 'Progress update message is required.'}, status=400)

    media_urls = []
    for f in request.FILES.getlist('images'):
        media_urls.append(save_uploaded_file(f, 'images'))

    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    user = request.current_user
    now = datetime.now(timezone.utc)
    new_update = {
        'status': status_val,
        'message': message,
        'officer': {
            'name': user.get('name', 'Department Officer'),
            'department': (user.get('department') or {}).get('name', 'Public Department'),
            'role': user.get('designation', 'Grievance Redressal Officer')
        },
        'timestamp': now,
        'media': media_urls
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {'status': status_val, 'updatedAt': now},
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('PROGRESS_UPDATE', performed_by=user, target_type='Complaint', target_id=doc.get('complaintId'), details=f"Progress added: {message[:60]}")

    return JsonResponse({'success': True, 'message': 'Progress update added successfully.', 'data': serialize_doc(updated)})

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def resolve_staff_complaint(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = request.POST.dict() if request.POST else {}
    if not data and request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            pass

    notes = data.get('notes', '').strip()
    if not notes:
        return JsonResponse({'success': False, 'message': 'Resolution report notes are required.'}, status=400)

    media_urls = []
    for f in request.FILES.getlist('resolutionMedia'):
        media_urls.append(save_uploaded_file(f, 'images'))

    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    user = request.current_user
    now = datetime.now(timezone.utc)
    officer_name = f"{user.get('name', 'Officer')} ({user.get('designation', 'Redressal Officer')})"

    new_update = {
        'status': 'Resolved',
        'message': f"Resolution Report: {notes}",
        'officer': {
            'name': user.get('name', 'Officer'),
            'department': (user.get('department') or {}).get('name', 'Department'),
            'role': user.get('designation', 'Officer')
        },
        'timestamp': now,
        'media': media_urls
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {
                'status': 'Resolved',
                'resolution': {
                    'notes': notes,
                    'resolvedAt': now,
                    'officer': officer_name,
                    'media': media_urls
                },
                'updatedAt': now
            },
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('COMPLAINT_RESOLVED', performed_by=user, target_type='Complaint', target_id=doc.get('complaintId'), details=f"Grievance marked as resolved: {notes[:60]}")

    return JsonResponse({'success': True, 'message': 'Grievance marked as resolved. Pending citizen verification.', 'data': serialize_doc(updated)})

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def escalate_staff_complaint(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    reason = data.get('reason', 'Escalated due to SLA breach or critical safety risk.')
    escalate_to = data.get('escalateTo', 'Divisional Grievance Cell & Oversight Directorate')

    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    user = request.current_user
    now = datetime.now(timezone.utc)
    prev_status = doc.get('status', 'Submitted')

    new_update = {
        'status': 'Escalated',
        'message': f"Escalated to {escalate_to}: \"{reason}\"",
        'officer': {
            'name': user.get('name', 'Officer'),
            'department': (user.get('department') or {}).get('name', 'Department'),
            'role': user.get('designation', 'Officer')
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
                    'previousStatus': prev_status,
                    'escalatedTo': escalate_to
                },
                'updatedAt': now
            },
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('COMPLAINT_ESCALATED', performed_by=user, target_type='Complaint', target_id=doc.get('complaintId'), details=f"Escalated to {escalate_to}")

    return JsonResponse({'success': True, 'message': f'Complaint escalated to {escalate_to}.', 'data': serialize_doc(updated)})

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def submit_email_change_request(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = parse_body(request)
    new_email = data.get('requestedEmail', '').strip().lower()
    reason = data.get('reason', '').strip()
    user = request.current_user

    if not new_email or not reason:
        return JsonResponse({'success': False, 'message': 'New official email and justification reason are required.'}, status=400)

    requests_col = get_email_change_requests_collection()
    now = datetime.now(timezone.utc)
    doc = {
        'role': 'EMPLOYEE',
        'user': user['_id'],
        'officer': user['_id'],
        'officerName': user.get('name', 'Officer'),
        'employeeId': user.get('employeeId', ''),
        'department': user.get('department', {}),
        'designation': user.get('designation', ''),
        'currentEmail': user.get('email', ''),
        'requestedEmail': new_email,
        'reason': reason,
        'contactPhone': user.get('phone', ''),
        'status': 'PENDING',
        'createdAt': now,
        'updatedAt': now
    }
    requests_col.insert_one(doc)

    return JsonResponse({'success': True, 'message': 'Email change request submitted to Super Administrator.'})

@csrf_exempt
@role_required('EMPLOYEE', 'SUPER_ADMIN')
def get_email_change_request_status(request):
    user = request.current_user
    requests_col = get_email_change_requests_collection()
    pending = requests_col.find_one({'user': user['_id']}, sort=[('createdAt', -1)])
    return JsonResponse({'success': True, 'request': serialize_doc(pending)})

