from django.contrib import admin

from .models import Company, ResearchReport, InvestmentScore, SavedCompany


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "sector", "created_at")
    search_fields = ("name", "sector")


@admin.register(ResearchReport)
class ResearchReportAdmin(admin.ModelAdmin):
    list_display = ("company", "user", "verdict", "created_at")
    list_filter = ("verdict",)
    search_fields = ("company__name", "user__username")


admin.site.register(InvestmentScore)
admin.site.register(SavedCompany)
