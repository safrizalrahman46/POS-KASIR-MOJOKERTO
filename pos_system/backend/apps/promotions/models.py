from django.db import models


class Voucher(models.Model):
    TYPE_CHOICES = [
        ('percent', 'Percent'),
        ('fixed', 'Fixed'),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=12, decimal_places=0)
    min_purchase = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    max_discount = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    usage_limit = models.IntegerField(default=0)
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.get_type_display()})"


class AutoDiscount(models.Model):
    TYPE_CHOICES = [
        ('percent_total', 'Percent of Total'),
        ('percent_item', 'Percent per Item'),
        ('fixed_item', 'Fixed per Item'),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=12, decimal_places=0)
    min_purchase = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    min_items = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
