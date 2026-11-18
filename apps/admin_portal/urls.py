from django.urls import path
from apps.admin_portal import views

urlpatterns = [
    path('dashboard/stats', views.get_admin_dashboard_stats, name='admin_dashboard_stats'),
    path('sync-data', views.sync_platform_data, name='admin_sync_data'),
    path('employees', views.employees_list_create, name='admin_employees'),
    path('employees/<str:id>', views.update_employee, name='admin_update_employee'),
    path('citizens', views.get_citizens, name='admin_get_citizens'),
    path('citizens/<str:id>/status', views.update_citizen_status, name='admin_update_citizen_status'),
    path('complaints', views.get_all_complaints, name='admin_all_complaints'),
    path('complaints/<str:id>/reassign', views.reassign_complaint_department, name='admin_reassign_complaint'),
    path('complaints/<str:id>/escalate', views.admin_escalate_complaint, name='admin_escalate_complaint'),
    path('audit-logs', views.get_audit_logs, name='admin_audit_logs'),
    path('departments', views.get_departments_directory, name='admin_departments_directory'),
    path('email-change-requests', views.get_email_change_requests, name='admin_get_email_change_requests'),
    path('email-change-requests/<str:id>/approve', views.approve_email_change_request, name='admin_approve_email_change'),
    path('email-change-requests/<str:id>/reject', views.reject_email_change_request, name='admin_reject_email_change'),
]
