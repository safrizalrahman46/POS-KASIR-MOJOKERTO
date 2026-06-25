from rest_framework import serializers
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Order, OrderItem
from apps.products.models import Product
from apps.promotions.models import Voucher


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(read_only=True)
    product_price = serializers.IntegerField(source='price', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_id', 'product_name', 'product_price',
            'quantity', 'price', 'discount_type', 'discount_value', 'subtotal',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'cashier', 'cashier_name', 'customer_name', 'status',
            'subtotal', 'discount_total', 'voucher_code', 'voucher_discount',
            'tax_total', 'grand_total', 'payment_method', 'payment_amount',
            'change_amount', 'created_at', 'items',
        ]


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    discount_type = serializers.ChoiceField(
        choices=['none', 'percent', 'fixed'], default='none'
    )
    discount_value = serializers.DecimalField(
        max_digits=12, decimal_places=0, default=0
    )


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100, required=False, default='')
    payment_method = serializers.ChoiceField(choices=['cash', 'debit', 'qris'])
    payment_amount = serializers.DecimalField(max_digits=12, decimal_places=0)
    items = OrderItemInputSerializer(many=True)
    voucher_code = serializers.CharField(max_length=50, required=False, default=None)

    def validate_items(self, items):
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Produk dengan ID {item['product_id']} tidak ditemukan."
                )
            if product.stock < item['quantity']:
                raise serializers.ValidationError(
                    f"Stok {product.name} tidak mencukupi. Tersedia: {product.stock}"
                )
        return items

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        voucher_code = validated_data.pop('voucher_code', None)
        cashier_name = validated_data.pop('customer_name', '')

        subtotal = 0
        item_details = []

        for item_data in items_data:
            product = Product.objects.select_for_update().get(
                id=item_data['product_id']
            )
            if product.stock < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Stok {product.name} tidak mencukupi."
                )
            price = product.price
            qty = item_data['quantity']
            line_total = price * qty

            discount_type = item_data.get('discount_type', 'none')
            discount_value = int(item_data.get('discount_value', 0))

            if discount_type == 'percent':
                discount_amount = int(line_total * discount_value / 100)
            elif discount_type == 'fixed':
                discount_amount = min(discount_value * qty, line_total)
            else:
                discount_amount = 0

            item_subtotal = line_total - discount_amount
            subtotal += item_subtotal

            item_details.append({
                'product': product,
                'product_name': product.name,
                'quantity': qty,
                'price': price,
                'discount_type': discount_type,
                'discount_value': discount_value,
                'subtotal': item_subtotal,
            })

        item_discount_total = sum(
            (item['price'] * item['quantity']) - item['subtotal']
            for item in item_details
        )

        voucher_discount = 0
        if voucher_code:
            try:
                voucher = Voucher.objects.select_for_update().get(
                    code=voucher_code,
                    is_active=True,
                    valid_from__lte=timezone.now(),
                    valid_until__gte=timezone.now(),
                )
                if voucher.usage_limit > 0 and voucher.used_count >= voucher.usage_limit:
                    raise serializers.ValidationError('Voucher sudah habis digunakan.')
                if subtotal < voucher.min_purchase:
                    raise serializers.ValidationError(
                        f"Minimal pembelian Rp{voucher.min_purchase:,} untuk voucher ini."
                    )
                if voucher.type == 'percent':
                    voucher_discount = int(subtotal * voucher.value / 100)
                    if voucher.max_discount:
                        voucher_discount = min(voucher_discount, voucher.max_discount)
                else:
                    voucher_discount = voucher.value
            except Voucher.DoesNotExist:
                raise serializers.ValidationError('Voucher tidak valid atau sudah kadaluarsa.')

        taxable_amount = subtotal - voucher_discount
        tax_total = int(taxable_amount * 11 / 100)
        grand_total = taxable_amount + tax_total

        payment_amount = int(validated_data.get('payment_amount', 0))
        if payment_amount < grand_total:
            raise serializers.ValidationError(
                f"Pembayaran kurang. Harus minimal Rp{grand_total:,}."
            )
        change_amount = payment_amount - grand_total

        order = Order.objects.create(
            cashier=user,
            customer_name=cashier_name,
            status='paid',
            subtotal=subtotal,
            discount_total=item_discount_total,
            voucher_code=voucher_code,
            voucher_discount=voucher_discount,
            tax_total=tax_total,
            grand_total=grand_total,
            payment_method=validated_data.get('payment_method'),
            payment_amount=payment_amount,
            change_amount=change_amount,
        )

        for detail in item_details:
            product = detail['product']
            quantity = detail['quantity']
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=detail['product_name'],
                quantity=quantity,
                price=detail['price'],
                discount_type=detail['discount_type'],
                discount_value=detail['discount_value'],
                subtotal=detail['subtotal'],
            )
            product.stock -= quantity
            product.save()

        if voucher_code:
            try:
                voucher = Voucher.objects.get(code=voucher_code)
                voucher.used_count += 1
                voucher.save()
            except Voucher.DoesNotExist:
                pass

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'stock_updates',
            {
                'type': 'stock_update',
                'data': {
                    'order_id': order.id,
                    'items': [
                        {'id': d['product'].id, 'name': d['product_name'], 'stock': d['product'].stock}
                        for d in item_details
                    ],
                },
            },
        )
        async_to_sync(channel_layer.group_send)(
            'order_updates',
            {
                'type': 'order_update',
                'data': {
                    'id': order.id,
                    'grand_total': str(order.grand_total),
                    'status': order.status,
                    'cashier': order.cashier.username,
                    'created_at': order.created_at.isoformat(),
                },
            },
        )

        return order


from django.utils import timezone
