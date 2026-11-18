"""
AI Intelligence API Views
Preview complaint formalization, urgency prediction, and department mapping.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from services.ai_engine import analyze_complaint_text
from services.departments import getAllDepartmentsList

@csrf_exempt
def preview_analysis(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = {}
    if request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            pass

    description = data.get('description', '')
    category = data.get('category', 'Other')
    location = data.get('location', '')

    result = analyze_complaint_text(description, category=category, location=location)

    return JsonResponse({
        'success': True,
        'data': result
    })

@csrf_exempt
def get_departments(request):
    return JsonResponse({
        'success': True,
        'data': getAllDepartmentsList()
    })

