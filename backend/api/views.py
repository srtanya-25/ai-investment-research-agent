"""
api/views.py
Aggregator views for the Investment Research Agent. The auth-check endpoint and
the research action stay as APIView (they wrap a service, not a model), while
companies, reports, and saved companies are exposed as proper REST resources.
"""
from django.http import Http404
from rest_framework import generics, viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from research.models import Company, ResearchReport, SavedCompany
from research.serializers import (
    CompanySerializer,
    ResearchReportSerializer,
    ResearchReportListSerializer,
    SavedCompanySerializer,
)
from research.services import run_research
from .paginations import ReportPagination


class DashboardProtectedView(APIView):
    """GET /api/v1/dashboard-protected/ - auth check used by AuthProvider."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": f"Welcome, {request.user.username}!",
            "user": {"id": request.user.id, "username": request.user.username},
        })


class RunResearchView(APIView):
    """POST /api/v1/research/ - run the full research pipeline for a company."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company_name = request.data.get("company_name")
        try:
            report = run_research(request.user, company_name)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)

        return Response(ResearchReportSerializer(report).data, status=201)


class ReportListView(generics.ListAPIView):
    """GET /api/v1/reports/ - the current user's research history."""
    serializer_class = ResearchReportListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ReportPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["verdict"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return ResearchReport.objects.filter(user=self.request.user).select_related(
            "company", "score"
        )


class ReportDetailView(generics.RetrieveAPIView):
    """GET /api/v1/reports/<id>/ - one full report owned by the user."""
    serializer_class = ResearchReportSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            return ResearchReport.objects.select_related("company", "score").get(
                pk=self.kwargs["pk"], user=self.request.user
            )
        except ResearchReport.DoesNotExist:
            raise Http404("Report not found.")


class CompanySearchView(generics.ListAPIView):
    """GET /api/v1/companies/?q=acme - search previously researched companies."""
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    queryset = Company.objects.all()
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "sector"]
    ordering_fields = ["name", "created_at"]


class SavedCompanyViewSet(viewsets.ModelViewSet):
    """CRUD on the current user's saved companies (wired through a router)."""
    serializer_class = SavedCompanySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        return SavedCompany.objects.filter(user=self.request.user).select_related("company")
