from django.urls import path
from apps.railway import views

urlpatterns = [
    path('dashboard/stats', views.get_railway_dashboard_stats, name='railway_dashboard_stats'),
    path('complaints', views.get_railway_complaints, name='railway_complaints'),
    path('complaints/<str:id>', views.get_railway_complaint_by_id, name='railway_complaint_detail'),
    path('complaints/<str:id>/status', views.update_railway_status, name='railway_update_status'),
    path('complaints/<str:id>/progress', views.add_railway_progress_update, name='railway_add_progress'),
    path('complaints/<str:id>/resolve', views.resolve_railway_complaint, name='railway_resolve'),
    path('complaints/<str:id>/escalate', views.escalate_railway_complaint, name='railway_escalate'),
]

