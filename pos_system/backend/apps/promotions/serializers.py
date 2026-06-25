from rest_framework import serializers
from django.utils import timezone
from .models import Voucher, AutoDiscount


class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = '__all__'
        read_only_fields = ['used_count', 'created_at']


class AutoDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoDiscount
        fields = '__all__'
        read_only_fields = ['created_at']


class ValidateVoucherSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    total_purchase = serializers.DecimalField(max_digits=12, decimal_places=0)

    def validate(self, data):
        now = timezone.now()
        try:
            voucher = Voucher.objects.get(
                code=data['code'],
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now,
            )
        except Voucher.DoesNotExist:
            raise serializers.ValidationError('Voucher tidak valid atau sudah kadaluarsa.')

        total = data['total_purchase']
        if total < voucher.min_purchase:
            raise serializers.ValidationError(
                f"Minimal pembelian Rp{voucher.min_purchase:,} untuk voucher ini."
            )

        if voucher.usage_limit > 0 and voucher.used_count >= voucher.usage_limit:
            raise serializers.ValidationError('Voucher sudah habis digunakan.')

        if voucher.type == 'percent':
            discount = int(total * voucher.value / 100)
            if voucher.max_discount:
                discount = min(discount, voucher.max_discount)
        else:
            discount = voucher.value

        data['voucher'] = voucher
        data['discount_amount'] = discount
        return data
