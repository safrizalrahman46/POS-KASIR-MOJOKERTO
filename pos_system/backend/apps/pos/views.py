from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from apps.products.models import Product


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.prefetch_related('items__product').all()
        if user.role != 'admin':
            queryset = queryset.filter(cashier=user)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        date_filter = self.request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(created_at__date=date_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save()


class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Order.objects.prefetch_related('items__product').all()
        if request.user.role != 'admin':
            queryset = queryset.filter(cashier=request.user)
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        status_filter = request.query_params.get('status')
        if from_date:
            queryset = queryset.filter(created_at__date__gte=from_date)
        if to_date:
            queryset = queryset.filter(created_at__date__lte=to_date)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        serializer = OrderSerializer(queryset, many=True)
        total = sum(order.grand_total for order in queryset)
        return Response({
            'count': queryset.count(),
            'total': total,
            'results': serializer.data,
        })


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = Order.objects.prefetch_related('items').get(id=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Pesanan tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)
        if order.status != 'pending':
            return Response(
                {'detail': 'Hanya pesanan dengan status pending yang dapat dibatalkan.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        order.status = 'cancelled'
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)
