from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['date', 'amount', 'fuel_kms']

@admin.register(Travel)
class TravelAdmin(admin.ModelAdmin):
    list_display = ['date', 'activity', 'from_location', 'to_location', 'expense', 'kms']

@admin.register(TaxPeriod)
class TaxPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start', 'end']

