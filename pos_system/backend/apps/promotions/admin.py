from django.contrib import admin
from .models import Voucher, AutoDiscount


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ['code', 'type', 'value', 'min_purchase', 'usage_limit', 'used_count', 'is_active', 'valid_from', 'valid_until']
    list_filter = ['type', 'is_active']
    search_fields = ['code']


@admin.register(AutoDiscount)
class AutoDiscountAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'value', 'min_purchase', 'min_items', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['name']
