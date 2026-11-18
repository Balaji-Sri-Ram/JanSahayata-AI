from django.urls import path
from apps.staff import views

urlpatterns = [
    path('dashboard/stats', views.get_staff_dashboard_stats, name='staff_dashboard_stats'),
    path('complaints', views.get_staff_complaints, name='staff_complaints'),
    path('complaints/<str:id>', views.get_staff_complaint_by_id, name='staff_complaint_detail'),
    path('complaints/<str:id>/status', views.update_staff_status, name='staff_update_status'),
    path('complaints/<str:id>/progress', views.add_staff_progress_update, name='staff_add_progress'),
    path('complaints/<str:id>/resolve', views.resolve_staff_complaint, name='staff_resolve_complaint'),
    path('complaints/<str:id>/escalate', views.escalate_staff_complaint, name='staff_escalate_complaint'),
    path('email-change-request', views.submit_email_change_request, name='staff_submit_email_change'),
    path('email-change-request/status', views.get_email_change_request_status, name='staff_get_email_change_status'),
]

