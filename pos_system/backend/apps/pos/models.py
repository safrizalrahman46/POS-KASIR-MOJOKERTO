from django.db import models
from django.conf import settings


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('debit', 'Debit'),
        ('qris', 'QRIS'),
    ]

    cashier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders',
    )
    customer_name = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    voucher_code = models.CharField(max_length=50, null=True, blank=True)
    voucher_discount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    tax_total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, null=True, blank=True)
    payment_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    change_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.cashier.username} - {self.status}"


class OrderItem(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('none', 'None'),
        ('percent', 'Percent'),
        ('fixed', 'Fixed'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
    )
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=0)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='none')
    discount_value = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=0)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
