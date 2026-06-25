from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('vouchers', views.VoucherViewSet)
router.register('auto-discounts', views.AutoDiscountViewSet)

urlpatterns = [
    path('validate-voucher/', views.ValidateVoucherView.as_view(), name='validate-voucher'),
    path('', include(router.urls)),
]
