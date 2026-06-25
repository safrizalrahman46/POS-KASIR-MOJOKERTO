from rest_framework import serializers
from apps.pos.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'cashier_name', 'customer_name', 'status',
            'subtotal', 'discount_total', 'voucher_code', 'voucher_discount',
            'tax_total', 'grand_total', 'payment_method', 'payment_amount',
            'change_amount', 'created_at', 'items',
        ]
