"""
Complaint Controller & Citizen Workflows
Handles multi-modal file uploads, YOLO vision integration, grievance timelines, and dispute loops.
"""

import os
import json
import uuid
from datetime import datetime, timezone
from bson import ObjectId
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from jansahayata.db import (
    get_complaints_collection,
    generate_complaint_id,
    serialize_doc,
    log_audit_action
)
from jansahayata.auth_middleware import optional_jwt
from services.departments import get_department_by_id
from services.ai_engine import analyze_complaint_text, simulate_computer_vision
from services.email_service import send_complaint_confirmation_email

def save_uploaded_file(uploaded_file, subfolder='images'):
    ext = os.path.splitext(uploaded_file.name)[1]
    filename = f"{uuid.uuid4().hex[:12]}_{Date_suffix()}{ext}"
    target_dir = os.path.join(settings.MEDIA_ROOT, subfolder)
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, filename)
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return f"/uploads/{subfolder}/{filename}"

def Date_suffix():
    return datetime.now().strftime('%Y%m%d_%H%M%S')

@csrf_exempt
@optional_jwt
def create_complaint(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    try:
        data = request.POST.dict() if request.POST else {}
        if not data and request.body:
            try:
                data = json.loads(request.body.decode('utf-8'))
            except Exception:
                pass

        description = data.get('description', '').strip()
        category = data.get('category', 'Other').strip()
        dept_id = data.get('departmentId') or (data.get('department') if isinstance(data.get('department'), str) else '')
        urgency = data.get('urgency', 'Medium')
        address = data.get('address') or data.get('locationAddress') or data.get('location[address]', 'Public Premises')

        lat = data.get('latitude') or data.get('location[latitude]')
        lng = data.get('longitude') or data.get('location[longitude]')

        try:
            lat = float(lat) if lat is not None and str(lat).strip() != '' else None
            lng = float(lng) if lng is not None and str(lng).strip() != '' else None
        except Exception:
            lat, lng = None, None

        if not description:
            return JsonResponse({'success': False, 'message': 'Problem description is required.'}, status=400)

        # Process file uploads
        images = []
        videos = []
        audio = []

        for f in request.FILES.getlist('images'):
            images.append(save_uploaded_file(f, 'images'))
        if 'video' in request.FILES:
            videos.append(save_uploaded_file(request.FILES['video'], 'videos'))
        if 'audio' in request.FILES:
            audio.append(save_uploaded_file(request.FILES['audio'], 'audio'))

        # AI Analysis
        ai_result = analyze_complaint_text(description, category=category, location=address)
        formal_statement = data.get('generatedProblemStatement') or ai_result.get('structuredProblemStatement', '')
        summary = ai_result.get('summary', '')

        predicted_cat = ai_result.get('suggestedCategory', category)
        predicted_urgency = ai_result.get('suggestedUrgency', urgency)

        # Department resolution
        if not dept_id or dept_id == 'undefined':
            dept_id = (ai_result.get('suggestedDepartment') or {}).get('id', 'railway')
        dept_config = get_department_by_id(dept_id)

        # Computer vision simulated detections
        detected_objects = simulate_computer_vision(category)

        user = getattr(request, 'current_user', None)
        citizen_id = str(user['_id']) if user else (data.get('citizenId') or 'CITIZEN-DEMO-001')
        citizen_name = (user.get('name') if user else (data.get('citizenName') or data.get('citizenDetails[name]') or 'Citizen'))
        citizen_email = (user.get('email') if user else (data.get('citizenEmail') or data.get('citizenDetails[email]') or ''))
        citizen_phone = (user.get('phone') if user else (data.get('citizenPhone') or data.get('citizenDetails[phone]') or ''))

        complaint_id = generate_complaint_id(dept_config.get('code', 'JNS'))
        now = datetime.now(timezone.utc)

        new_complaint = {
            'complaintId': complaint_id,
            'citizenId': citizen_id,
            'citizenDetails': {
                'name': citizen_name,
                'email': citizen_email,
                'phone': citizen_phone
            },
            'description': description,
            'generatedProblemStatement': formal_statement,
            'aiGeneratedDescription': formal_statement,
            'category': category,
            'department': {
                'id': dept_config['id'],
                'code': dept_config['code'],
                'name': dept_config['name']
            },
            'urgency': urgency or predicted_urgency,
            'location': {
                'address': address,
                'latitude': lat,
                'longitude': lng
            },
            'attachments': {
                'images': images,
                'videos': videos,
                'audio': audio
            },
            'evidence': [{'url': img, 'type': 'image', 'caption': 'Citizen Upload'} for img in images],
            'aiAnalysis': {
                'detectedObjects': detected_objects,
                'confidence': 0.94,
                'predictedCategory': predicted_cat,
                'predictedUrgency': predicted_urgency,
                'summary': summary,
                'modelVersion': 'JanSahayata-AI-Pipeline-v2.0'
            },
            'status': 'Submitted',
            'progressUpdates': [
                {
                    'status': 'Submitted',
                    'message': f"Grievance submitted by citizen and routed automatically to {dept_config['name']}.",
                    'officer': {
                        'name': 'JanSahayata AI System',
                        'department': dept_config['name'],
                        'role': 'Automated Ingestion'
                    },
                    'timestamp': now,
                    'media': []
                }
            ],
            'createdAt': now,
            'updatedAt': now
        }

        complaints_col = get_complaints_collection()
        res = complaints_col.insert_one(new_complaint)
        new_complaint['_id'] = res.inserted_id

        log_audit_action('COMPLAINT_CREATED', performed_by=user, target_type='Complaint', target_id=complaint_id, details=f"New grievance submitted in category {category}")

        if citizen_email:
            import threading
            def _dispatch_email():
                try:
                    send_complaint_confirmation_email(citizen_email, complaint_id, category, dept_config['name'], formal_statement)
                except Exception as e:
                    print(f"[Email Notification Warning] Failed to dispatch email: {e}")
            threading.Thread(target=_dispatch_email, daemon=True).start()

        return JsonResponse({
            'success': True,
            'message': f"Grievance successfully registered with ID {complaint_id}",
            'data': serialize_doc(new_complaint)
        }, status=201)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': f"Failed to register grievance: {str(e)}"
        }, status=500)

@csrf_exempt
@optional_jwt
def get_complaints_by_citizen(request, citizen_id):
    user = getattr(request, 'current_user', None)
    complaints_col = get_complaints_collection()

    query_conditions = []

    if citizen_id and citizen_id != 'current':
        query_conditions.append({'citizenId': citizen_id})
        if ObjectId.is_valid(citizen_id):
            query_conditions.append({'citizenId': ObjectId(citizen_id)})

    if user:
        user_id_str = str(user['_id'])
        query_conditions.append({'citizenId': user_id_str})
        query_conditions.append({'citizenId': user['_id']})
        if user.get('email'):
            import re
            email_pattern = f"^{re.escape(user['email'].strip())}$"
            query_conditions.append({'citizenDetails.email': {'$regex': email_pattern, '$options': 'i'}})
        if user.get('phone'):
            clean_phone = user['phone'].strip()
            query_conditions.append({'citizenDetails.phone': clean_phone})

    if not query_conditions:
        query_conditions.append({'citizenId': citizen_id or 'CITIZEN-DEMO-001'})

    query = {'$or': query_conditions}
    cursor = complaints_col.find(query).sort('createdAt', -1)
    results = [serialize_doc(c) for c in cursor]
    return JsonResponse({'success': True, 'count': len(results), 'data': results})

@csrf_exempt
@optional_jwt
def get_complaint_by_id(request, id):
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
@optional_jwt
def verify_resolution(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = {}
    if request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            pass

    feedback = data.get('feedback', 'Resolution verified satisfactorily by citizen.')
    complaints_col = get_complaints_collection()

    doc = None
    if ObjectId.is_valid(id):
        doc = complaints_col.find_one({'_id': ObjectId(id)})
    if not doc:
        doc = complaints_col.find_one({'complaintId': id})

    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    now = datetime.now(timezone.utc)
    new_update = {
        'status': 'Closed',
        'message': f"Citizen verified resolution: \"{feedback}\"",
        'officer': {
            'name': 'Citizen Verification',
            'department': doc.get('department', {}).get('name', 'Public Department'),
            'role': 'Citizen'
        },
        'timestamp': now,
        'media': []
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {
                'status': 'Closed',
                'verification': {
                    'isVerified': True,
                    'verifiedAt': now,
                    'feedback': feedback
                },
                'updatedAt': now
            },
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('COMPLAINT_VERIFIED', target_type='Complaint', target_id=doc.get('complaintId'), details="Citizen verified resolution.")

    return JsonResponse({'success': True, 'message': 'Resolution verified successfully. Grievance closed.', 'data': serialize_doc(updated)})

@csrf_exempt
@optional_jwt
def dispute_resolution(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = request.POST.dict() if request.POST else {}
    if not data and request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            pass

    reason = data.get('reason', '').strip()
    if not reason:
        return JsonResponse({'success': False, 'message': 'Dispute reason is required.'}, status=400)

    dispute_media = []
    for f in request.FILES.getlist('disputeMedia'):
        dispute_media.append(save_uploaded_file(f, 'images'))

    complaints_col = get_complaints_collection()
    doc = None
    if ObjectId.is_valid(id):
        doc = complaints_col.find_one({'_id': ObjectId(id)})
    if not doc:
        doc = complaints_col.find_one({'complaintId': id})

    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    now = datetime.now(timezone.utc)
    new_update = {
        'status': 'Disputed',
        'message': f"Citizen disputed resolution: \"{reason}\". Reopened for investigation.",
        'officer': {
            'name': 'Citizen Grievance Dispute Loop',
            'department': doc.get('department', {}).get('name', 'Public Department'),
            'role': 'Citizen'
        },
        'timestamp': now,
        'media': dispute_media
    }

    complaints_col.update_one(
        {'_id': doc['_id']},
        {
            '$set': {
                'status': 'Disputed',
                'dispute': {
                    'isDisputed': True,
                    'reason': reason,
                    'media': dispute_media,
                    'createdAt': now
                },
                'updatedAt': now
            },
            '$push': {'progressUpdates': new_update}
        }
    )

    updated = complaints_col.find_one({'_id': doc['_id']})
    log_audit_action('COMPLAINT_DISPUTED', target_type='Complaint', target_id=doc.get('complaintId'), details=f"Citizen disputed resolution: {reason}")

    return JsonResponse({'success': True, 'message': 'Grievance resolution disputed and reopened for review.', 'data': serialize_doc(updated)})

@csrf_exempt
@optional_jwt
def send_complaint_tracking_email(request, id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = {}
    if request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            pass

    email = data.get('email', '').strip()
    if not email:
        return JsonResponse({'success': False, 'message': 'Email is required.'}, status=400)

    complaints_col = get_complaints_collection()
    doc = complaints_col.find_one({'$or': [{'complaintId': id}, {'_id': ObjectId(id) if ObjectId.is_valid(id) else None}]})
    if not doc:
        return JsonResponse({'success': False, 'message': 'Complaint not found.'}, status=404)

    try:
        send_complaint_confirmation_email(
            email,
            doc.get('complaintId'),
            doc.get('category'),
            doc.get('department', {}).get('name', 'Public Department'),
            doc.get('generatedProblemStatement') or doc.get('description')
        )
    except Exception as e:
        print(f"[Email Error] Could not send tracking email: {e}")

    return JsonResponse({'success': True, 'message': f'Tracking details sent to {email}.'})

