from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/', views.SalesReportView.as_view(), name='dashboard-reports'),
]
