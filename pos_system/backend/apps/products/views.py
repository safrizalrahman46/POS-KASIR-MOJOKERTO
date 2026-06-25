from rest_framework import viewsets, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductListSerializer,
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'barcode']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related('category').all()
        if self.request.user.role != 'admin':
            queryset = queryset.filter(is_active=True)
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) | models.Q(barcode__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


import django.db.models as models


class ProductSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '')
        if not q:
            return Response([])
        products = Product.objects.filter(
            models.Q(name__icontains=q) | models.Q(barcode__icontains=q),
            is_active=True,
        )[:20]
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class StockUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        if not product_id or quantity is None:
            return Response({'detail': 'product_id dan quantity diperlukan.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'detail': 'Produk tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)
        product.stock += int(quantity)
        if product.stock < 0:
            return Response({'detail': 'Stok tidak mencukupi.'}, status=status.HTTP_400_BAD_REQUEST)
        product.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'stock_updates',
            {
                'type': 'stock_update',
                'data': {
                    'id': product.id,
                    'name': product.name,
                    'stock': product.stock,
                },
            },
        )
        return Response({'id': product.id, 'name': product.name, 'stock': product.stock})
