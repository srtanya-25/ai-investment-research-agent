"""
api/urls.py - single aggregator for /api/v1/* endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views
from accounts.views import (
    RegisterView, LoginView, LogoutView, RefreshView, MeView,
)

# ViewSet routing (DefaultRouter)
router = DefaultRouter()
router.register("saved", views.SavedCompanyViewSet, basename="saved")

urlpatterns = [
    # Authentication (HTTP-only cookie JWT)
    path("register/", RegisterView.as_view(), name="register"),
    path("login/",    LoginView.as_view(),    name="login"),
    path("logout/",   LogoutView.as_view(),   name="logout"),
    path("refresh/",  RefreshView.as_view(),  name="refresh"),
    path("me/",       MeView.as_view(),       name="me"),

    # SimpleJWT built-in views (bearer-token flow - useful for Postman)
    path("token/",         TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(),    name="token_refresh"),

    # Auth check (used by AuthProvider on app load)
    path("dashboard-protected/", views.DashboardProtectedView.as_view(), name="dashboard-protected"),

    # Research
    path("research/",          views.RunResearchView.as_view(), name="research"),
    path("reports/",           views.ReportListView.as_view(),  name="reports"),
    path("reports/<int:pk>/",  views.ReportDetailView.as_view(), name="report-detail"),
    path("companies/",         views.CompanySearchView.as_view(), name="companies"),

    # Saved companies (router)
    path("", include(router.urls)),
]
