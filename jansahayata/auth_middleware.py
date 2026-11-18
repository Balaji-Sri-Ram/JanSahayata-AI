"""
JWT Authentication & Role-Based Access Control Decorators for Django Views
"""

from functools import wraps
from bson import ObjectId
from django.http import JsonResponse
from jansahayata.db import decode_jwt_token, get_users_collection

def get_authenticated_user(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, "Authentication token required. Please log in."

    token = auth_header.split(' ')[1].strip()
    if not token:
        return None, "Malformed authorization token."

    try:
        decoded = decode_jwt_token(token)
        user_id = decoded.get('userId')
        if not user_id:
            return None, "Invalid token payload."

        users = get_users_collection()
        user = users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return None, "User account not found or session expired."

        if user.get('status') == 'Disabled':
            return None, "Your account has been deactivated by the administrator."

        return user, None
    except Exception as e:
        return None, f"Invalid or expired session token. ({str(e)})"

def jwt_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user, err = get_authenticated_user(request)
        if not user:
            return JsonResponse({'success': False, 'message': err or "Authentication required."}, status=401)
        request.current_user = user
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def role_required(*allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user, err = get_authenticated_user(request)
            if not user:
                return JsonResponse({'success': False, 'message': err or "Authentication required."}, status=401)

            if user.get('role') not in allowed_roles:
                return JsonResponse({
                    'success': False,
                    'message': f"Forbidden: You do not have permission ({', '.join(allowed_roles)} required, current role: {user.get('role')})."
                }, status=403)

            request.current_user = user
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

def optional_jwt(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user, _ = get_authenticated_user(request)
        request.current_user = user
        return view_func(request, *args, **kwargs)
    return _wrapped_view

