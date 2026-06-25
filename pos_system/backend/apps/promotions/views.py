from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Voucher, AutoDiscount
from .serializers import (
    VoucherSerializer,
    AutoDiscountSerializer,
    ValidateVoucherSerializer,
)


class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'detail': 'Hanya admin.'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'detail': 'Hanya admin.'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            return Response({'detail': 'Hanya admin.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()


class AutoDiscountViewSet(viewsets.ModelViewSet):
    queryset = AutoDiscount.objects.all()
    serializer_class = AutoDiscountSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'detail': 'Hanya admin.'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'detail': 'Hanya admin.'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            return Response({'detail': 'Hanya admin.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()


class ValidateVoucherView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ValidateVoucherSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                'valid': True,
                'discount_amount': serializer.validated_data['discount_amount'],
                'voucher_code': serializer.validated_data['voucher'].code,
                'type': serializer.validated_data['voucher'].type,
                'value': serializer.validated_data['voucher'].value,
                'message': 'Voucher valid.',
            })
        return Response({
            'valid': False,
            'message': serializer.errors['non_field_errors'][0] if 'non_field_errors' in serializer.errors else 'Voucher tidak valid.',
        }, status=status.HTTP_400_BAD_REQUEST)
