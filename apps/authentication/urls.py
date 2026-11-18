from django.urls import path
from apps.authentication import views

urlpatterns = [
    path('register', views.register_citizen, name='auth_register'),
    path('register-send-otp', views.register_send_otp, name='auth_register_send_otp'),
    path('register-verify-otp', views.register_verify_otp, name='auth_register_verify_otp'),
    path('login', views.login_citizen, name='auth_login'),
    path('staff-login', views.login_staff, name='auth_staff_login'),
    path('me', views.get_current_user, name='auth_me'),
    path('logout', views.logout_user, name='auth_logout'),
    path('first-time-reset-password', views.first_time_reset_password, name='auth_first_time_reset_password'),
    path('send-password-otp', views.send_password_otp, name='auth_send_password_otp'),
    path('change-password-with-otp', views.change_password_with_otp, name='auth_change_password_with_otp'),
    path('citizen-email-change/send-current-otp', views.send_citizen_current_email_otp, name='citizen_email_send_current_otp'),
    path('citizen-email-change/verify-current-otp', views.verify_citizen_current_email_otp, name='citizen_email_verify_current_otp'),
    path('citizen-email-change/send-new-otp', views.send_citizen_new_email_otp, name='citizen_email_send_new_otp'),
    path('citizen-email-change/confirm-new-email', views.confirm_citizen_new_email, name='citizen_email_confirm_new_email'),
    path('citizen-email-change/request-admin', views.request_citizen_admin_email_change, name='citizen_email_request_admin'),
    path('citizen-email-change/status', views.get_citizen_email_change_status, name='citizen_email_change_status'),
    path('forgot-password/send-otp', views.forgot_password_send_otp, name='auth_forgot_password_send_otp'),
    path('forgot-password/send-otp/', views.forgot_password_send_otp, name='auth_forgot_password_send_otp_slash'),
    path('forgot-password/verify-otp', views.forgot_password_verify_otp, name='auth_forgot_password_verify_otp'),
    path('forgot-password/verify-otp/', views.forgot_password_verify_otp, name='auth_forgot_password_verify_otp_slash'),
    path('forgot-password/reset-password', views.forgot_password_reset_password, name='auth_forgot_password_reset_password'),
    path('forgot-password/reset-password/', views.forgot_password_reset_password, name='auth_forgot_password_reset_password_slash'),
]

