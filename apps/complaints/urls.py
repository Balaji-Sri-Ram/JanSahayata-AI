from django.urls import path
from apps.complaints import views

urlpatterns = [
    path('', views.create_complaint, name='complaint_create'),
    path('citizen/<str:citizen_id>', views.get_complaints_by_citizen, name='complaint_by_citizen'),
    path('<str:id>', views.get_complaint_by_id, name='complaint_get_by_id'),
    path('<str:id>/verify-resolution', views.verify_resolution, name='complaint_verify_resolution'),
    path('<str:id>/dispute', views.dispute_resolution, name='complaint_dispute_resolution'),
    path('<str:id>/send-tracking-email', views.send_complaint_tracking_email, name='complaint_send_tracking_email'),
]

