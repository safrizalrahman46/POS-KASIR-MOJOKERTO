from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet)
router.register('', views.ProductViewSet)

urlpatterns = [
    path('search/', views.ProductSearchView.as_view(), name='product-search'),
    path('stock/update/', views.StockUpdateView.as_view(), name='stock-update'),
    path('', include(router.urls)),
]
