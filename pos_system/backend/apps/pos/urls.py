from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('orders', views.OrderViewSet)

urlpatterns = [
    path('orders/history/', views.OrderHistoryView.as_view(), name='order-history'),
    path('orders/<int:pk>/cancel/', views.CancelOrderView.as_view(), name='order-cancel'),
    path('', include(router.urls)),
]
