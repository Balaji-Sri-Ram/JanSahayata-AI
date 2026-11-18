from django.urls import path
from apps.ai_service import views

urlpatterns = [
    path('preview-analysis', views.preview_analysis, name='ai_preview_analysis'),
    path('departments', views.get_departments, name='ai_departments'),
]

