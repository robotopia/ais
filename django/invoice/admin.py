from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'number', 'bsb']

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['date', 'qty', 'activity_type', 'invoice']

@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    list_display = ['description', 'rate']

@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'abn', 'is_gst_registered']

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_email']

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'bill_to', 'created', 'issued', 'due', 'paid']

