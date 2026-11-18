"""
JanSahayata AI Master URL Configuration
Exposes REST APIs, Media Uploads, and serves the Frontend Single Page Application.
"""

import os
import mimetypes
from datetime import datetime, timezone
from pathlib import Path
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse, JsonResponse, FileResponse
from django.urls import path, include, re_path
from django.views.static import serve
from apps.complaints import views as complaint_views

def health_check(request):
    return JsonResponse({
        'status': 'online',
        'service': 'JanSahayata Grievance Intelligence Platform Backend (Django)',
        'version': '2.0.0-django',
        'database': 'MongoDB',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

def serve_frontend_assets(request, path):
    asset_file = settings.BASE_DIR / 'frontend' / 'dist' / 'assets' / path
    if asset_file.exists() and asset_file.is_file():
        content_type, _ = mimetypes.guess_type(str(asset_file))
        if str(asset_file).endswith('.js'):
            content_type = 'text/javascript'
        elif str(asset_file).endswith('.css'):
            content_type = 'text/css'
        return FileResponse(open(asset_file, 'rb'), content_type=content_type or 'application/octet-stream')
    return HttpResponse(status=404)

def serve_frontend_app(request):
    req_path = request.path.lstrip('/')
    dist_dir = settings.BASE_DIR / 'frontend' / 'dist'
    public_dir = settings.BASE_DIR / 'frontend' / 'public'

    # Check if a specific static/public file was requested (e.g. /emblem.jpg, /emblem.svg)
    if req_path:
        target = dist_dir / req_path
        if not (target.exists() and target.is_file()):
            target = public_dir / req_path
        if target.exists() and target.is_file():
            content_type, _ = mimetypes.guess_type(str(target))
            return FileResponse(open(target, 'rb'), content_type=content_type or 'application/octet-stream')

    # Default SPA entry point
    index_file = dist_dir / 'index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse("<h1>JanSahayata AI - Django Backend Online</h1><p>Frontend build index.html not found. Run <code>npm run build</code> in <code>frontend/</code>.</p>")

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/complaints', complaint_views.create_complaint, name='complaint_create_noslash'),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/admin/', include('apps.admin_portal.urls')),
    path('api/railway/', include('apps.railway.urls')),
    path('api/ai/', include('apps.ai_service.urls')),
    path('api/health', health_check, name='api_health'),

    # Media / File Uploads Serving
    re_path(r'^uploads/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),

    # Frontend Assets Serving (Vite build assets)
    re_path(r'^assets/(?P<path>.*)$', serve_frontend_assets),

    # Catch-all Route for React Router SPA
    re_path(r'^(?!api/|uploads/|admin/|assets/).*$', serve_frontend_app),
]

