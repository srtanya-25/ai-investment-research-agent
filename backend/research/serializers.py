from rest_framework import serializers

from .models import Company, ResearchReport, InvestmentScore, SavedCompany


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "sector", "description", "created_at"]


class InvestmentScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentScore
        fields = ["business_score", "growth_score", "risk_score", "overall_score"]


class ResearchReportSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    score = InvestmentScoreSerializer(read_only=True)
    verdict_label = serializers.CharField(source="get_verdict_display", read_only=True)

    class Meta:
        model = ResearchReport
        fields = [
            "id", "company",
            "business_analysis", "growth_analysis", "risk_analysis",
            "summary", "verdict", "verdict_label", "score", "created_at",
        ]
        read_only_fields = fields


class ResearchReportListSerializer(serializers.ModelSerializer):
    """Lighter shape for the history list - no long analysis text."""
    company = CompanySerializer(read_only=True)
    overall_score = serializers.IntegerField(source="score.overall_score", read_only=True)

    class Meta:
        model = ResearchReport
        fields = ["id", "company", "verdict", "overall_score", "created_at"]


class SavedCompanySerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedCompany
        fields = ["id", "company", "company_id", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        obj, _ = SavedCompany.objects.get_or_create(
            user=validated_data["user"],
            company_id=validated_data["company_id"],
        )
        return obj
