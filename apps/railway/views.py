"""
Railway Backward Compatibility Endpoints
Allows legacy client routes to hit railway-specific grievance actions directly.
"""

from apps.staff import views as staff_views

def get_railway_dashboard_stats(request):
    return staff_views.get_staff_dashboard_stats(request)

def get_railway_complaints(request):
    return staff_views.get_staff_complaints(request)

def get_railway_complaint_by_id(request, id):
    return staff_views.get_staff_complaint_by_id(request, id)

def update_railway_status(request, id):
    return staff_views.update_staff_status(request, id)

def add_railway_progress_update(request, id):
    return staff_views.add_staff_progress_update(request, id)

def resolve_railway_complaint(request, id):
    return staff_views.resolve_staff_complaint(request, id)

def escalate_railway_complaint(request, id):
    return staff_views.escalate_staff_complaint(request, id)

